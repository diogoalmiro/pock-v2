import { Transform, Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsDate, IsDateString, IsNegative, IsNotEmpty, IsPositive, IsString, Matches, Min, MinLength, ValidateIf } from "class-validator";

export class TransactionCreateDto {
    @IsString()
    @IsNotEmpty()
    trip: string = "";

    @IsString()
    @IsNotEmpty()
    payer: string = "";

    @Transform(({value: v}) => Array.isArray(v) ? v : [v])
    @IsArray()
    @ArrayMinSize(1)
    @IsString({each: true})
    @IsNotEmpty({each: true})
    payees: string[] = [];

    @Type(() => Number)
    amount: number = 0;

    @IsString()
    description: string = "";

    @IsDateString()
    @ValidateIf(o => console.log(o) as any ||false)
    date: string = "";
}

export class TransactionUpdateDto extends TransactionCreateDto {
    @IsString()
    @IsNotEmpty()
    id: string = "";
}