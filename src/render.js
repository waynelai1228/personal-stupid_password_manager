const fs = require('fs');
const { dialog } = require('electron').remote;

const StageAreaEnum = Object.freeze({
    NOTHING: 0,
    ADD_PREVIEW: 1,
    DECRYPT_VIEW: 2,
    REMOVE_PREVIEW: 3
});

function hex2ascii(hexString) {
    hexString = hexString.toString();
    let str = '';
    for (let i = 0; i < hexString.length; i += 2) {
        str += String.fromCharCode(parseInt(hexString.substr(i, 2), 16));
    }
    return str;
}

function currentDate() {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();
    return today = dd + "_" + mm + "_" + yyyy;
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
        stored_passwords: {},

        StageAreaEnum: StageAreaEnum,
        stage_area_view: StageAreaEnum.NOTHING
    },
    methods: {
        inputChange: function() {
            if (this.service_name == '' || this.service_name == 'hasOwnProperty') {
                this.stage_area_view = StageAreaEnum.NOTHING;
            }
            else if (this.stored_passwords.hasOwnProperty(this.service_name) && this.encrypt_password == '') {
                this.encrypted_password = this.stored_passwords[this.service_name];
                this.stage_area_view = StageAreaEnum.REMOVE_PREVIEW;
            }
            else if (this.stored_passwords.hasOwnProperty(this.service_name) && this.encrypt_password != '') {
                const encrypted = this.stored_passwords[this.service_name];
                this.decrypted_password = CryptoJS.AES.decrypt(encrypted, this.encrypt_password);
                this.decrypted_password = hex2ascii(this.decrypted_password);
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
            if (this.stage_area_view == StageAreaEnum.ADD_PREVIEW) {
                this.stored_passwords[this.service_name] = this.encrypted_password;
                this.clearFields();
            }
        },

        removeClicked: function() {
            if (this.stage_area_view == StageAreaEnum.DECRYPT_VIEW || this.stage_area_view == StageAreaEnum.REMOVE_PREVIEW) {
                delete this.stored_passwords[this.service_name];
                this.clearFields();
            }
        },

        clearFields: function() {
            this.service_name = '';
            this.encrypt_password = '';
            this.service_password = '';
            this.encrypt_password = '';
            this.decrypted_password = '';
            this.stage_area_view = StageAreaEnum.NOTHING;
        },

        saveClicked: function() {
            let passwordData = JSON.stringify(this.stored_passwords);
            const filePath = dialog.showSaveDialogSync({
                buttonLabel: "Save Passwords",
                defaultPath: "password-" + currentDate() + ".json"
            });

            fs.writeFile(filePath, passwordData, () => console.log("file saved at " + filePath));
        },

        importClicked: function() {
            const filePath = dialog.showOpenDialogSync({
                buttonLabel: "Select file",
                filters: [
                    {name: "JSON files", extensions: ["json"]}
                ],
                properties: ["openFile"]
            });

            fs.readFile(filePath[0], (err, file_json) => {
                if (err) {
                    console.log("error from opening file: " + err);
                    return;
                }
                try {
                    this.stored_passwords = JSON.parse(file_json);
                }
                catch (err) {
                    console.log("error from parsing: " + err);
                }
            });
        }
    }
});