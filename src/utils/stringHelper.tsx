export function formatCurrency(value:string|number){
    return !value ? " ": new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
}

export function formatDate(value:string|Date, options?: any){
    const date = new Date(value);
    return !value ? " ": new Intl.DateTimeFormat('pt-br', options).format(date);
}

export function formatCnpj (cnpj:string) {
    return !cnpj ? " ": cnpj.replace('/', '%2F');
}