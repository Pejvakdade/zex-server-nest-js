import { ApiOperation } from '@nestjs/swagger';

export function ApiOperationWithRoles(summary: string) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const roles = Reflect.getMetadata('roles', descriptor.value)
            || Reflect.getMetadata('roles', target[propertyKey])
            || [];

        const description = roles.length > 0
            ? `Required role${roles.length > 1 ? 's' : ''}: ${roles.join(', ')}`
            : 'No authentication required';

        ApiOperation({ summary, description })(target, propertyKey, descriptor);
    };
}
