import { IsBoolean } from "class-validator";
import { RoomMessagesHelper } from "../helpers/roommessages.helper";
import { JoinRoomDto } from "./joinroom.dto";

export class ToglViewDto extends JoinRoomDto{   

    @IsBoolean({message: RoomMessagesHelper.VIEW_NOT_VALID})
    viewed: boolean;
}