
export function resourceName(showName: string){
    return showName.replaceAll(" ", "-").toLocaleLowerCase();
}