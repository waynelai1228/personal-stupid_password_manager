const StageAreaEnum = Object.freeze({
    NOTHING: 0,
    ADD_PREVIEW: 1,
    DECRYPT_VIEW: 2
});

function hex2ascii(hexString) {
    hexString = hexString.toString();
    let str = '';
    for (let i = 0; i < hexString.length; i += 2) {
        str += String.fromCharCode(parseInt(hexString.substr(i, 2), 16));
    }
    return str;
}

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
                const encrypted = this.stored_passwords.get(this.service_name);
                this.decrypted_password = CryptoJS.AES.decrypt(encrypted, this.encrypt_password);
                this.decrypted_password = hex2ascii(this.decrypted_password);
                console.log(this.decrypted_password);
                this.stage_area_view = StageAreaEnum.DECRYPT_VIEW;
            }
            else if (this.service_name != '' && this.encrypt_password != '' && this.service_password != '') {
                this.encrypted_password = CryptoJS.AES.encrypt(this.service_password, this.encrypt_password).toString();
                this.stage_area_view = StageAreaEnum.ADD_PREVIEW;
            }
            else {
                this.stage_area_view = StageAreaEnum.NOTHING;
            }
        },

        addClicked: function () {
            if (this.stage_area_view == StageAreaEnum.ADD_PREVIEW){
                this.stored_passwords.set(this.service_name, this.encrypted_password)
                this.service_name = '';
                this.encrypt_password = '';
                this.encrypted_password = '';
                this.service_password = '';
                this.stage_area_view = StageAreaEnum.NOTHING
            }
        }
    }
});

