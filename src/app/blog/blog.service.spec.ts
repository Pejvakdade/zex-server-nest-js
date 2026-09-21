/** --------------------------------------------------------------------------------------------------------------------
 * @file blog.service.spec.ts
 * @fileOverview slug derivation and de-duplication, the publish date being set exactly once, reading time,
 *               and the cache being flushed on every write (repository + Redis mocked).
 */
import { BlogNamespace } from './namespace/blog.namespace';
import { BlogPostEntity } from './domain/entities/blogPost.entity';
import { BlogService, readingMinutes, slugify } from './blog.service';

const post = (overrides: Partial<BlogPostEntity> = {}): BlogPostEntity =>
  ({
    _id: 'b1',
    title: 'Hello',
    slug: 'hello',
    status: BlogNamespace.EStatus.DRAFT,
    publishedAt: null,
    body: 'x',
    author: { fullName: 'Ada' },
    ...overrides,
  }) as unknown as BlogPostEntity;

describe('slugify / readingMinutes', () => {
  it('turns a title into a url segment', () => {
    expect(slugify('Choosing a VPS: what matters?')).toBe('choosing-a-vps-what-matters');
    expect(slugify('  Ünïcode — dashes ')).toBe('unicode-dashes');
    expect(slugify('!!!')).toBe('post');
  });

  it('never reports less than one minute', () => {
    expect(readingMinutes('')).toBe(1);
    expect(readingMinutes(Array(450).fill('word').join(' '))).toBe(2);
  });
});

describe('BlogService', () => {
  const repository = {
    findSlugsLike: jest.fn(),
    findById: jest.fn(),
    findWithAuthor: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findForHome: jest.fn(),
  };
  const redis = { get: jest.fn(), set: jest.fn(), delByPattern: jest.fn() };
  const service = new BlogService(repository as never, redis as never);

  beforeEach(() => {
    jest.clearAllMocks();
    redis.get.mockResolvedValue(null);
    redis.set.mockResolvedValue('OK');
    redis.delByPattern.mockResolvedValue(1);
    repository.findSlugsLike.mockResolvedValue([]);
    repository.findWithAuthor.mockImplementation(async (_id: string) => post({ _id }));
  });

  it('derives the slug from the title and skips taken ones', async () => {
    repository.findSlugsLike.mockResolvedValue(['hello', 'hello-2']);
    repository.create.mockResolvedValue(post({ _id: 'new' }));

    await service.create({ title: 'Hello', body: 'x' } as never, 'u1');

    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ slug: 'hello-3', authorId: 'u1' }));
    expect(redis.delByPattern).toHaveBeenCalledWith('blog:*');
  });

  it('stamps publishedAt when a post is created as Published', async () => {
    repository.create.mockResolvedValue(post());

    await service.create({ title: 'Hello', body: 'x', status: BlogNamespace.EStatus.PUBLISHED } as never, 'u1');

    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ publishedAt: expect.any(Date) }));
  });

  it('sets publishedAt on the first publish only', async () => {
    repository.findById.mockResolvedValue(post());
    await service.update('b1', { status: BlogNamespace.EStatus.PUBLISHED } as never);
    expect(repository.findByIdAndUpdate).toHaveBeenCalledWith('b1', expect.objectContaining({ publishedAt: expect.any(Date) }));

    const firstDate = new Date('2026-01-01');
    repository.findById.mockResolvedValue(post({ status: BlogNamespace.EStatus.DRAFT, publishedAt: firstDate }));
    await service.update('b1', { status: BlogNamespace.EStatus.PUBLISHED } as never);
    const patch = repository.findByIdAndUpdate.mock.calls[1][1];
    expect(patch.publishedAt).toBeUndefined();
  });

  it('keeps the slug of a post saved without a slug change', async () => {
    repository.findById.mockResolvedValue(post({ slug: 'hello' }));
    repository.findSlugsLike.mockResolvedValue(['hello']);

    await service.update('b1', { slug: 'hello', body: 'longer body here' } as never);

    expect(repository.findByIdAndUpdate).toHaveBeenCalledWith('b1', expect.objectContaining({ slug: 'hello', readingMinutes: 1 }));
  });

  it('serves the home list from cache and strips the author relation on a miss', async () => {
    redis.get.mockResolvedValueOnce(JSON.stringify([{ _id: 'cached' }]));
    await expect(service.findForHome()).resolves.toEqual([{ _id: 'cached' }]);
    expect(repository.findForHome).not.toHaveBeenCalled();

    repository.findForHome.mockResolvedValue([post()]);
    const [view] = await service.findForHome();
    expect(view).toMatchObject({ _id: 'b1', authorName: 'Ada' });
    expect((view as any).author).toBeUndefined();
    expect(redis.set).toHaveBeenCalledWith('blog:home', expect.any(String), 300);
  });

  it('404s for an unknown slug', async () => {
    (repository as any).findPublishedBySlug = jest.fn().mockResolvedValue(null);
    await expect(service.findBySlug('nope')).rejects.toMatchObject({ status: 404 });
  });
});
