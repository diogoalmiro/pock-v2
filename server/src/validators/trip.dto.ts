import { IsNotEmpty, IsString } from "class-validator";

export class TripCreateDto {
    @IsString()
    @IsNotEmpty()
    tripname?: string;

    @IsString()
    @IsNotEmpty()
    showName?: string;
}


export class TripUpdateDto extends TripCreateDto {
    @IsString()
    @IsNotEmpty()
    id: string = "";
}