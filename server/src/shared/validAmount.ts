export function validAmount(val: string){
    return !!val.match(/^-?\d+(.\d{0,2})?$/)
}