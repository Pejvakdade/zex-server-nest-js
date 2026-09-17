import {Global, Module} from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { GateKeeperGuard } from './gate-keeper.guard';

@Global()
@Module({
    imports: [
        JwtModule.register({
            global: true,
        }),
    ],
    providers: [GateKeeperGuard],
    exports: [GateKeeperGuard, JwtModule],
})
export class GateKeeperModule { }
