const app = new Vue({
    el: '#app',
    data: {
        title: 'Stupid Password Manager',
        service_name: null,
        encrypt_password: null,
        service_password: null,
        encrypted_password: null
    },
    methods: {
        passwordChange: function() {
            if (this.encrypt_password != null && this.service_password != null) {
                let salt = CryptoJS.lib.WordArray.random(128/8);
                let iv = CryptoJS.lib.WordArray.random(128/8);
                let key512Bits1000Iterations = CryptoJS.PBKDF2("Secret Passphrase", salt, {
                    keySize: 512 / 32,
                    iterations: 1000
                });
                this.encrypted_password = salt + ":" + iv + ":" + CryptoJS.AES.encrypt(this.service_password, key512Bits1000Iterations, {iv: iv}).toString();
            }
        }
    }
});
