import { Injectable } from "@angular/core";
import { ActionSheetController, Platform, ToastController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { FILE_EXTENSION_HEADERS } from "../../constants/file-extensions";
import { HttpService } from "../http/http.service";
import { UtilService } from "../util/util.service";
import { HttpClient } from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})
export class AttachmentService {
    mediaType: string;
    texts: any;
    isIos;
    fileBasePath;
    actionSheet;
    constructor(
        private actionSheetController: ActionSheetController,
        private toastController: ToastController,
        private utils: UtilService,
        private http: HttpClient,
        private translate: TranslateService,
    ) {
    }

    getActionSheetButtons(profileImageData): any {
        let buttons = [];
        this.utils.getActionSheetButtons(profileImageData).forEach(element => {
            let button = {
                text: element.text,
                handler: async () => {
                    if (element.action == 'camera') {
                        this.actionSheetController.dismiss(element.type);
                        return false;
                    } else if (element.action == 'remove') {
                        this.removeCurrentPhoto();
                        return false;
                    } else if (element.action == 'cancel') {
                        this.actionSheetController.dismiss();
                        return false;
                    } else {
                        return false;
                    }
                },
            }
            buttons.push(button);
        });
        return buttons;
    }
    removeCurrentPhoto() {
        this.translate
            .get([
                "REMOVE_CURRENT_PHOTO"
            ])
            .subscribe((data) => {
                this.texts = data;
            });
        this.actionSheetController.dismiss('removeCurrentPhoto');
        this.presentToast(this.texts["REMOVE_CURRENT_PHOTO"], "success");
    }
    async selectImage(profileImageData) {
        this.translate
            .get([
                "ERROR_WHILE_STORING_FILE",
                "SUCCESSFULLY_ATTACHED"
            ])
            .subscribe((data) => {
                this.texts = data;
            });
        let opts = {
            buttons: this.getActionSheetButtons(profileImageData)
        };
        this.actionSheet = await this.actionSheetController.create(opts);
        await this.actionSheet.present();
        return this.actionSheet.onDidDismiss();
    }

    async presentToast(text, color = "danger") {
        const toast = await this.toastController.create({
            message: text,
            position: "top",
            duration: 3000,
            color: color,
        });
        toast.present();
    }

    mimeType(fileName) {
        let ext = fileName.split(".").pop();
        return FILE_EXTENSION_HEADERS[ext];
    }

    cloudImageUpload(fileDetails, uploadUrl) {
        var options = {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        };
        return this.http.put(uploadUrl.signedUrl, fileDetails, options)
    }
}