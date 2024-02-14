import { IsBoolean } from 'class-validator';
import { RoomMessagesHelper } from '../helpers/roommessages.helper';
import { JoinRoomDto } from './joinroom.dto';

export class inRoom extends JoinRoomDto{
  @IsBoolean({ message: RoomMessagesHelper.IN_ROOM_NOT_VALID })
  inRoom: boolean;
}