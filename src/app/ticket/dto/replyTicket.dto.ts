import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class ReplyTicketDto {
  @ApiProperty({ example: "Thanks for flagging this — we're looking into it now." })
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  text: string;
}
