export function resetPasswordToken(length: number) {
    let token = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        token += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return token;
}