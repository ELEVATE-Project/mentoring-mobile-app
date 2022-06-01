import { Injectable } from "@angular/core";
import { Camera, CameraOptions, PictureSourceType } from "@awesome-cordova-plugins/camera/ngx";
import { Chooser } from "@awesome-cordova-plugins/chooser/ngx";
import { FilePath } from "@awesome-cordova-plugins/file-path/ngx";
import { File } from "@ionic-native/file/ngx";
import { ActionSheetController, Platform, ToastController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { FILE_EXTENSION_HEADERS } from "../../constants/file-extensions";
import { urlConstants } from "../../constants/urlConstants";
import { HttpService } from "../http/http.service";
import { UtilService } from "../util/util.service";
import { FileTransfer, FileTransferObject } from '@awesome-cordova-plugins/file-transfer/ngx';

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
        private camera: Camera,
        private file: File,
        private actionSheetController: ActionSheetController,
        private toastController: ToastController,
        private platform: Platform,
        private filePath: FilePath,
        private chooser: Chooser,
        private utils: UtilService,
        private translate: TranslateService,
        private httpService: HttpService,
        private fileTransfer : FileTransfer
        // private filePickerIOS: IOSFilePicker,
    ) {
        this.isIos = this.platform.is('ios');
        this.fileBasePath = this.isIos ? this.file.documentsDirectory : this.file.externalDataDirectory;
    }

    getActionSheetButtons(type): any {
        let buttons = [];
        this.utils.getActionSheetButtons(type).forEach(element => {
            let button = {
                text: element.text,
                handler: () => {
                    if (element.action == 'camera') {
                        this.takePicture(element.type == 'PHOTOLIBRARY' ? this.camera.PictureSourceType.PHOTOLIBRARY : this.camera.PictureSourceType.CAMERA);
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
    let data ={
        type:'removeCurrentPhoto'
    }
    this.actionSheetController.dismiss(data);
    }
    async selectImage(type) {
        this.translate
            .get([
                "ERROR_WHILE_STORING_FILE",
                "SUCCESSFULLY_ATTACHED"
            ])
            .subscribe((data) => {
                this.texts = data;
            });
        let opts = {
            buttons: this.getActionSheetButtons(type)
        };
        this.actionSheet = await this.actionSheetController.create(opts);
        await this.actionSheet.present();
        return this.actionSheet.onDidDismiss();
    }

    takePicture(sourceType: PictureSourceType) {
        var options: CameraOptions = {
            quality: 10,
            sourceType: sourceType,
            saveToPhotoAlbum: false,
            correctOrientation: true,
        };
        this.camera
            .getPicture(options)
            .then((imagePath) => {
                if (this.platform.is("android") && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
                    this.filePath
                        .resolveNativePath(imagePath)
                        .then((filePath) => {
                            this.copyFile(filePath);
                        })
                } else {
                    this.copyFile(imagePath);
                }
            })
            .catch((err) => {
                if (err !== "No Image Selected") {
                    this.actionSheetController.dismiss();
                    this.presentToast(this.texts["ERROR_WHILE_STORING_FILE"]);
                }
            });
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

    async openFile() {
        try {
            const file = await this.chooser.getFile();
            const pathToWrite = this.directoryPath();
            const newFileName = this.createFileName(file.name)
            const writtenFile = await this.file.writeFile(pathToWrite, newFileName, file.data.buffer)
            if (writtenFile.isFile) {
                const data = {
                    name: newFileName,
                    type: this.mimeType(newFileName),
                    isUploaded: false,
                    url: "",
                };

                this.presentToast(this.texts["SUCCESSFULLY_ATTACHED"], "success");
                this.actionSheetController.dismiss(data);
            }
        } catch (error) {
            this.presentToast(this.texts["ERROR_WHILE_STORING_FILE"]);
        }
    }

    copyFile(filePath) {
        let correctPath = filePath.substr(0, filePath.lastIndexOf("/") + 1);
        let currentName = filePath.split("/").pop();
        currentName = currentName.split("?")[0];
        this.copyFileToLocalDir(correctPath, currentName, this.createFileName(currentName));
    }

    copyFileToLocalDir(namePath, currentName, newFileName) {
        this.file.copyFile(namePath, currentName, this.directoryPath(), newFileName).then(
            (success) => {
                const data = {
                    name: newFileName,
                    type: this.mimeType(newFileName),
                    isUploaded: false,
                };

                this.presentToast(this.texts["SUCCESSFULLY_ATTACHED"], "success");
                this.actionSheetController.dismiss(data);
            },
            (error) => {
                this.presentToast(this.texts["ERROR_WHILE_STORING_FILE"]);
            }
        );
    }
    createFileName(name) {
        let d = new Date(),
            n = d.getTime(),
            extentsion = name.split(".").pop(),
            newFileName = n + "." + extentsion;
        return newFileName;
    }

    directoryPath(): string {
        if (this.platform.is("ios")) {
            return this.file.documentsDirectory;
        } else {
            return this.file.externalDataDirectory;
        }
    }

    mimeType(fileName) {
        let ext = fileName.split(".").pop();
        return FILE_EXTENSION_HEADERS[ext];
    }

    deleteFile(fileName) {
        return this.file.removeFile(this.directoryPath(), fileName);
    }

    cloudImageUpload(fileDetails) {
        return new Promise((resolve, reject) => {
            this.file.checkFile(this.fileBasePath, fileDetails.name).then(success => {
              var options = {
                fileKey: fileDetails.name,
                fileName: fileDetails.name,
                chunkedMode: false,
                mimeType: fileDetails.type,
                headers: {
                  "Content-Type": "multipart/form-data",
                  "x-ms-blob-type":
                    fileDetails.cloudStorage === "AZURE"
                      ? "BlockBlob"
                      : null,
                },
                httpMethod: "PUT",
              };
              const fileTrans: FileTransferObject = this.fileTransfer.create();
              fileTrans.upload(this.fileBasePath + fileDetails.name, fileDetails.uploadUrl.signedUrl, options).then(success => {
                resolve(success)
              }).catch(error => {
                reject(error)
              })
            }).catch(error => {
              reject(error)
            })
          })
    }
}