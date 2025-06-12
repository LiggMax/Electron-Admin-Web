/**
 * id格式化
 */
export default function formatId(id: string ,Begin:number,  End:number) {
    if(id.length <= 12) return  id;
    return `${id.substring(0, Begin)}...${id.substring(id.length - End)}`;
}