const StageAreaEnum = Object.freeze({
    NOTHING: 0,
    ADD_PREVIEW: 1,
    DECRYPT_VIEW: 2
});

const app = new Vue({
    el: '#app',
    data: {
        title: 'Stupid Password Manager',
        service_name: '',
        encrypt_password: '',
        service_password: '',
        encrypted_password: '',
        decrypted_password: '',
        stored_passwords: new Map(),

        StageAreaEnum: StageAreaEnum,
        stage_area_view: StageAreaEnum.NOTHING
    },
    methods: {
        inputChange: function() {
            if (this.service_name == '' || this.encrypt_password == '') {
                this.stage_area_view = StageAreaEnum.NOTHING;
            }
            if (this.stored_passwords.has(this.service_name.toLowerCase()) && this.encrypt_password != '') {
                this.stored_passwords.get(this.service_name);
                this.stage_area_view = StageAreaEnum.DECRYPT_VIEW;
            }
            else if (this.service_name != '' && this.encrypt_password != '' && this.service_password != '') {
                let salt = CryptoJS.lib.WordArray.random(128/8);
                let iv = CryptoJS.lib.WordArray.random(128/8);
                let key512Bits1000Iterations = CryptoJS.PBKDF2("Secret Passphrase", salt, {
                    keySize: 512 / 32,
                    iterations: 1000
                });
                this.encrypted_password = new EncryptedPasswordAES(salt, iv, CryptoJS.AES.encrypt(this.service_password, key512Bits1000Iterations, {iv: iv})).toString();
                this.stage_area_view = StageAreaEnum.ADD_PREVIEW;
            }
            else {
                this.stage_area_view = StageAreaEnum.NOTHING;
            }
        },

        addClicked: function () {
            if (this.stage_area_view == StageAreaEnum.ADD_PREVIEW){
                this.stored_passwords.set(this.service_name, EncryptedPasswordAES.encryptedPasswordFromString(this.encrypted_password))
                this.service_name = '';
                this.encrypt_password = '';
                this.encrypted_password = '';
                this.service_password = '';
                this.stage_area_view = StageAreaEnum.NOTHING
            }
        }
    }
});

class EncryptedPasswordAES {
    constructor(salt, iv, encrypted_text) {
        this.salt = salt;
        this.iv = iv;
        this.encrypted_text = encrypted_text;
    }

    toString() {
        return this.salt + ":" + this.iv + ":" + this.encrypted_text;
    }

    static encryptedPasswordFromString(encryptedPasswordString){
        let encryptedPasswordComponents = encryptedPasswordString.split(":");
        return new EncryptedPasswordAES(encryptedPasswordComponents[0], encryptedPasswordComponents[1], encryptedPasswordComponents[2]);
    }
}
