class User {
    
    constructor() {
    }

    saveToCookie() {
        const userData = JSON.stringify({ name: this.name, nicknames: this.nicknames });
        document.cookie = `user=${encodeURIComponent(userData)}; path=/;`;
    }

    loadFromCookie() {
        const cookies = document.cookie.split('; ');
        const userCookie = cookies.find(cookie => cookie.startsWith('user='));
        if (userCookie) {
            const userData = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
            this.name = userData.name || '';
            this.nicknames = userData.nicknames || [];
        }
    }

    setName(name) {
        this.name = name;
        this.saveToCookie();
    }

    addNickname(nickname) {
        this.nicknames.push(nickname);
        this.saveToCookie();
    }

    removeNickname(nickname) {
        this.nicknames = this.nicknames.filter(n => n !== nickname);
        this.saveToCookie();
    }
}

export default User;

