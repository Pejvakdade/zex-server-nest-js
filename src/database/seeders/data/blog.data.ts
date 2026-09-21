/** --------------------------------------------------------------------------------------------------------------------
 * @file blog.data.ts
 * @fileOverview three sample posts so the homepage slider and the Blog page are not empty on a fresh
 *               database. Dev only — see blog.seeder.ts.
 */
export interface ISeedBlogPost {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  tags: Array<string>;
  featured: boolean;
  /** How many days before "now" the post was published, so the list has a believable spread. */
  daysAgo: number;
}

export const SEED_BLOG_POSTS: Array<ISeedBlogPost> = [
  {
    title: 'VPS or dedicated server: how to pick the right box',
    slug: 'vps-or-dedicated-server',
    excerpt:
      'Both run your workload — the difference is what you pay for, what you share and how far you can push it. A short, honest comparison.',
    tags: ['Guides', 'VPS', 'Dedicated'],
    featured: true,
    daysAgo: 3,
    body: `A VPS and a dedicated server both give you root, a public IP and a place to run whatever you like. The differences show up in three places: **isolation**, **ceiling** and **price**.

## Isolation

A VPS is a slice of a larger machine. The hypervisor keeps neighbours apart, but you still share the physical CPU cache, the disk controller and the network card. For most web apps this never matters. For latency-sensitive trading bots or heavy databases it sometimes does.

A dedicated server is yours alone. Nothing else runs on the metal.

## Ceiling

- A VPS scales *up* by resizing — a reboot and you have more cores.
- A dedicated server scales by ordering another one.

If your load doubles every quarter, start on a VPS. If your load is steady and heavy, dedicated is usually cheaper per core.

## Price

| | Starting price | Best for |
|---|---|---|
| VPS | a few dollars a month | sites, APIs, staging, bots |
| Dedicated | from ~$99 a month | databases, game servers, big builds |

> Rule of thumb: if you are asking the question, a VPS is the right first answer. Move to dedicated when a graph tells you to, not a feeling.

Still unsure? [Open a ticket](/support) and tell us what you are running — we will point you at the smallest thing that works.`,
  },
  {
    title: 'Hardening a fresh Ubuntu VPS in ten minutes',
    slug: 'hardening-a-fresh-ubuntu-vps',
    excerpt:
      'The five commands worth running before you deploy anything: a non-root user, key-only SSH, a firewall, automatic updates and fail2ban.',
    tags: ['Security', 'VPS', 'Linux'],
    featured: false,
    daysAgo: 11,
    body: `Every VPS we hand over starts with a root password. Here is what to do in the first ten minutes.

## 1. Make a user, stop using root

\`\`\`bash
adduser deploy
usermod -aG sudo deploy
\`\`\`

## 2. Keys only

Copy your public key to \`/home/deploy/.ssh/authorized_keys\`, then in \`/etc/ssh/sshd_config\`:

\`\`\`
PasswordAuthentication no
PermitRootLogin no
\`\`\`

Restart \`sshd\` **from a second terminal** so you cannot lock yourself out.

## 3. Firewall

\`\`\`bash
ufw allow OpenSSH
ufw allow 80,443/tcp
ufw enable
\`\`\`

## 4. Unattended upgrades

\`\`\`bash
apt install unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
\`\`\`

## 5. fail2ban

\`\`\`bash
apt install fail2ban
\`\`\`

The defaults ban an IP after five failed SSH attempts. That alone removes most of the noise you will see in \`auth.log\`.

That is it. Everything else — monitoring, backups, a reverse proxy — can wait until there is something to protect.`,
  },
  {
    title: 'Why we put a datacenter in Frankfurt',
    slug: 'why-frankfurt',
    excerpt:
      'DE-CIX, sub-10 ms to most of Europe and a power grid that does not blink. A look at how we choose locations.',
    tags: ['Locations', 'Network'],
    featured: false,
    daysAgo: 24,
    body: `When we add a location we score it on four things: **peering**, **latency to customers**, **power reliability** and **legal footing**. Frankfurt wins on all four.

## Peering

Frankfurt is home to DE-CIX, one of the largest internet exchanges in the world. Traffic to almost any European network stays local, which is why a Frankfurt VPS feels fast from Warsaw, Madrid and Stockholm alike.

## Latency

From our racks in Equinix FR5 we measure:

- Amsterdam — 6 ms
- Paris — 9 ms
- London — 12 ms
- Milan — 13 ms

## Power

The German grid is boring in the best way. Our facility adds N+1 UPS and generators on top, and the last unplanned outage on record is from before we arrived.

## Data protection

Data stored in Frankfurt sits under German and EU law, which is what many of our customers need to write into their own contracts.

See every site on the [Locations page](/locations).`,
  },
];
