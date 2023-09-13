import { Injectable } from "@angular/core";
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { File } from "@ionic-native/file/ngx";
import { ActionSheetController, Platform, ToastController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { FILE_EXTENSION_HEADERS } from "../../constants/file-extensions";
import { HttpService } from "../http/http.service";
import { UtilService } from "../util/util.service";
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { CapacitorHttp } from '@capacitor/core';

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
        private file: File,
        private actionSheetController: ActionSheetController,
        private toastController: ToastController,
        private platform: Platform,
        private utils: UtilService,
        private translate: TranslateService,
        private httpService: HttpService,
        private fileTransfer : FileTransfer
    ) {
    }

    getActionSheetButtons(type): any {
        let buttons = [];
        this.utils.getActionSheetButtons(type).forEach(element => {
            let button = {
                text: element.text,
                handler: async () => {
                    if (element.action == 'camera') {
                        await this.takePicture(element.type == 'PHOTOLIBRARY' ? CameraSource.Photos : CameraSource.Camera);
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
    this.translate
            .get([
                "REMOVE_CURRENT_PHOTO"
            ])
            .subscribe((data) => {
                this.texts = data;
            });
    this.actionSheetController.dismiss(data);
    this.presentToast(this.texts["REMOVE_CURRENT_PHOTO"], "success");
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

    async takePicture(sourceType: CameraSource) {
        const image = await Camera.getPhoto({
            quality: 90,
            allowEditing: false,
            resultType: CameraResultType.Uri,
            source: sourceType
        });
        await this.copyFileToLocalDir(image);
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

    // async openFile() {
    //     try {
            // const file = await this.chooser.getFile();
            // const pathToWrite = this.directoryPath();
            // const newFileName = this.createFileName(file.name)
            // const writtenFile = await this.file.writeFile(pathToWrite, newFileName, file.data.buffer)
            // if (writtenFile.isFile) {
            //     const data = {
            //         name: newFileName,
            //         type: this.mimeType(newFileName),
            //         isUploaded: false,
            //         url: "",
            //     };

            //     this.presentToast(this.texts["SUCCESSFULLY_ATTACHED"], "success");
            //     this.actionSheetController.dismiss(data);
            // }
    //     } catch (error) {
    //         this.presentToast(this.texts["ERROR_WHILE_STORING_FILE"]);
    //     }
    // }

    async copyFileToLocalDir(image) {
        const base64Data = await this.readAsBase64(image);
        const savedFile = await Filesystem.writeFile({
            path: image.webPath!,
            data: base64Data,
            directory: Directory.Data,
            recursive: true
        });
        image.type = this.mimeType(image.path),
        image.name = new Date().getTime()+'.'+image.path.split(".").pop();
        this.presentToast(this.texts["SUCCESSFULLY_ATTACHED"], "success");
        this.actionSheetController.dismiss(image);
    }

    private async readAsBase64(photo: Photo) {
        if (this.platform.is('hybrid')) {
            const file = await Filesystem.readFile({
                path: photo.path
            });
    
            return file.data;
        }
        else {
            // Fetch the photo, read as a blob, then convert to base64 format
            const response = await fetch(photo.webPath);
            const blob = await response.blob();
    
            return await this.convertBlobToBase64(blob) as string;
        }
    }
    
    // Helper function
    convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
        const reader = new FileReader;
        reader.onerror = reject;
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.readAsDataURL(blob);
    });

    // createFileName(name) {
    //     let d = new Date(),
    //         n = d.getTime(),
    //         extentsion = name.split(".").pop().split(".").pop(),
    //         newFileName = n + "." + extentsion;
    //     return newFileName;
    // }

    // directoryPath(): string {
    //     if (this.platform.is("ios")) {
    //         return this.file.documentsDirectory;
    //     } else {
    //         return this.file.externalDataDirectory;
    //     }
    // }

    mimeType(fileName) {
        let ext = fileName.split(".").pop();
        return FILE_EXTENSION_HEADERS[ext];
    }

    // deleteFile(fileName) {
    //     return this.file.removeFile(this.directoryPath(), fileName);
    // }

    async cloudImageUpload(fileDetails,uploadUrl) {
        console.log(fileDetails)
            // var options = {
            // fileKey: fileDetails.name,
            // fileName: fileDetails.name,
            // chunkedMode: false,
            // mimeType: fileDetails.type, 
            const headers= {
                "Content-Type": "multipart/form-data",
                // "mimeType": fileDetails.type,
                // "fileName": fileDetails.name,
                // "fileKey": fileDetails.name,
            }
            // httpMethod: "PUT",
            // };
            const savedFile = await Filesystem.readFile({
                path: fileDetails.webPath!,
                directory: Directory.Data,
            });
            // const formData = new FormData();
            // let response = await fetch(fileDetails.webPath)
            // formData.append('file', savedFile.data);
            //   const fileTrans: FileTransferObject = fileTransfer.create();
            //   fileTrans.upload(fileDetails.name, fileDetails.uploadUrl.signedUrl, options).then(success => {
            //     resolve(success)
            //   }).catch(error => {
            //     reject(error)
            //   })
            console.log(savedFile.data)
            const option = {
                url: uploadUrl.signedUrl,
                headers: headers,
                data: savedFile.data,
              };
            return CapacitorHttp.put(option).then((data)=>{
                console.log(data)
                return data
            })
    }
}