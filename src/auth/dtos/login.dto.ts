import { IsEmail, IsNotEmpty } from "class-validator";
import { MessagesHelper } from "../helpers/messages.helper";

export class LoginDto {
    //Decorator para o email para validar se o e-mail é valido ou não
    @IsEmail({}, {message: MessagesHelper.AUTH_LOGIN_NOT_FOUND})  //MassageHelper vai puxar a mensagem que salvamos no AUTH_LOGIN_NOT_FOUND
    login: string;

    //Decorator para a senha para validar se a senha é valida ou não
    @IsNotEmpty({message : MessagesHelper.AUTH_PASSWORD_NOT_FOUND}) //MassageHelper vai puxar a mensagem que salvamos no AUTH_PASSWORD_NOT_FOUND
    password: string;
}