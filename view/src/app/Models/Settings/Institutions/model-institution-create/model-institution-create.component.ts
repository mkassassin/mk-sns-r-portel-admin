import { Component, OnInit, ElementRef, ViewChild  } from '@angular/core';
import { Subject } from 'rxjs';
import { FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';

import { BsModalRef } from 'ngx-bootstrap/modal';
import * as CryptoJS from 'crypto-js';
import { map } from 'rxjs/operators';

import { InstitutionService } from './../../../../Services/settings/institution/institution.service';
import { DepartmentService } from './../../../../Services/settings/department/department.service';
import { DesignationService } from './../../../../Services/settings/Designation/designation.service';
import { ToastrService } from './../../../../Services/common-services/toastr-service/toastr.service';
import { LoginService } from './../../../../Services/LoginService/login.service';

@Component({
  selector: 'app-model-institution-create',
  templateUrl: './model-institution-create.component.html',
  styleUrls: ['./model-institution-create.component.css']
})
export class ModelInstitutionCreateComponent implements OnInit {

   onClose: Subject<any>;

   @ViewChild('fileInput') fileInput: ElementRef;
   FormData: FormData = new FormData;
   Show_Img_Preview: Boolean = false;
   Preview_Img: any ;

   Type: string;
   Data;
   _InstitutionCategory: any[] = [ { Category: 'Engineering', Type: 'Type_1'},
                                 { Category: 'Arts & Science', Type: 'Type_2'},
                                 { Category: 'Education', Type: 'Type_3'},
                                 { Category: 'School', Type: 'Type_4'}];
   _Departments: any[] = [];
   _Designation: any[] = [];
   Uploading: Boolean = false;
   Form: FormGroup;
   User_Id;

   constructor( public bsModalRef: BsModalRef,
                public Service: InstitutionService,
                private Toastr: ToastrService,
                public Login_Service: LoginService,
                public Department_Service: DepartmentService,
                public Designation_Service: DesignationService
            ) {
               this.User_Id = this.Login_Service.LoginUser_Info()['_id'];
            }

   ngOnInit() {
      this.onClose = new Subject();

      if (this.Type === 'Create' || this.Type === 'Edit') {
         const Data = {'User_Id' : this.User_Id };
         let Info = CryptoJS.AES.encrypt(JSON.stringify(Data), 'SecretKeyIn@123');
         Info = Info.toString();
         this.Department_Service.Department_List({'Info': Info}).subscribe( response => {
            const ResponseData = JSON.parse(response['_body']);
            if (response['status'] === 200 && ResponseData['Status'] ) {
               const CryptoBytes  = CryptoJS.AES.decrypt(ResponseData['Response'], 'SecretKeyOut@123');
               const DecryptedData = JSON.parse(CryptoBytes.toString(CryptoJS.enc.Utf8));
               this._Departments = DecryptedData;
               if (this.Type === 'Edit') {
                  const setValue = [];
                  this.Data.Departments.map(obj => {
                     setValue.push(obj._id);
                  });
                  this.Form.controls['Departments'].setValue(setValue);
               }
            } else if (response['status'] === 400 || response['status'] === 417 && !ResponseData['Status']) {
               this.Toastr.NewToastrMessage({ Type: 'Error', Message: ResponseData['Message'] });
            } else if (response['status'] === 401 && !ResponseData['Status']) {
               this.Toastr.NewToastrMessage({ Type: 'Error',  Message: ResponseData['Message'] });
            } else {
               this.Toastr.NewToastrMessage({ Type: 'Error', Message: 'Department List Getting Error!, But not Identify!' });
            }
         });
         this.Designation_Service.Designation_List({'Info': Info}).subscribe( response => {
            const ResponseData = JSON.parse(response['_body']);
            if (response['status'] === 200 && ResponseData['Status'] ) {
               const CryptoBytes  = CryptoJS.AES.decrypt(ResponseData['Response'], 'SecretKeyOut@123');
               const DecryptedData = JSON.parse(CryptoBytes.toString(CryptoJS.enc.Utf8));
               this._Designation = DecryptedData;
               if (this.Type === 'Edit') {
                  const setValue = [];
                  this.Data.Designation.map(obj => {
                     setValue.push(obj._id);
                  });
                  this.Form.controls['Designation'].setValue(setValue);
               }
            } else if (response['status'] === 400 || response['status'] === 417 && !ResponseData['Status']) {
               this.Toastr.NewToastrMessage({ Type: 'Error', Message: ResponseData['Message'] });
            } else if (response['status'] === 401 && !ResponseData['Status']) {
               this.Toastr.NewToastrMessage({ Type: 'Error',  Message: ResponseData['Message'] });
            } else {
               this.Toastr.NewToastrMessage({ Type: 'Error', Message: 'Designation List Getting Error!, But not Identify!' });
            }
         });
      }

      // If Create New Institution
         if (this.Type === 'Create') {
            this.Form = new FormGroup({
               Institution: new FormControl( '', {  validators: Validators.required,
                                                      asyncValidators: [this.Institution_AsyncValidate.bind(this)],
                                                      updateOn: 'blur' } ),
               Institution_Code: new FormControl('', Validators.required ),
               Institution_Category: new FormControl(null, Validators.required ),
               Designation: new FormControl(null, Validators.required ),
               Departments: new FormControl(null, Validators.required ),
               Created_By: new FormControl( this.User_Id, Validators.required ),
            });
         }

      // If Edit New Institution
         if (this.Type === 'Edit') {
            this.Form = new FormGroup({
               Institution: new FormControl(this.Data.Institution, { validators: Validators.required,
                                                                        asyncValidators: [this.Institution_AsyncValidate.bind(this)],
                                                                        updateOn: 'blur' }),
               Institution_Code: new FormControl(this.Data.Institution_Code, Validators.required ),
               Institution_Category: new FormControl(this.Data.Institution_Category, Validators.required ),
               Designation: new FormControl(null, Validators.required ),
               Departments: new FormControl(null, Validators.required ),
               Institution_Id: new FormControl(this.Data._id, Validators.required),
               Modified_By: new FormControl(this.User_Id, Validators.required)
            });
            this.Show_Img_Preview = true ;
            this.Preview_Img = 'http://139.59.59.41:4000/API/Uploads/Institutions/' + this.Data.Image.filename;
         }
   }

   // onSubmit Function
      onSubmit() {
         if (this.Type === 'Create') {
            this.submit();
         }
         if (this.Type === 'Edit') {
            this.update();
         }
      }

      Institution_AsyncValidate( control: AbstractControl ) {
         const Data = { Institution: control.value, User_Id: this.User_Id  };
         let Info = CryptoJS.AES.encrypt(JSON.stringify(Data), 'SecretKeyIn@123');
         Info = Info.toString();
         return this.Service.Institution_AsyncValidate({'Info': Info}).pipe(map( response => {
            if (this.Type === 'Edit' && this.Data.Institution === control.value) {
               return null;
            } else {
               const ReceivingData = JSON.parse(response['_body']);
               if (response['status'] === 200 && ReceivingData['Status'] && ReceivingData['Available']) {
                  return null;
               } else {
                  return { Institution_NotAvailable: true};
               }
            }
         }));
      }

      onFileChange(event) {
         if (event.target.files && event.target.files.length > 0) {
           this.Show_Img_Preview = true ;
           const reader = new FileReader();
             reader.readAsDataURL(event.target.files[0]);
             reader.onload = (events) => {
               this.Preview_Img = events.target['result'];
             };
           const file = event.target.files[0];
           this.FormData.set('image', file, file.name);
         } else {
           this.Show_Img_Preview = false ;
         }
       }

   // Submit New Institution
      submit() {
         if (this.Form.valid && !this.Uploading) {
            this.Uploading = true;
            const Data = this.Form.value;
            let Info = CryptoJS.AES.encrypt(JSON.stringify(Data), 'SecretKeyIn@123');
            Info = Info.toString();
            this.FormData.set('Info', Info);
            this.Service.Institution_Create(this.FormData).subscribe( response => {
               this.Uploading = false;
               const ReceivingData = JSON.parse(response['_body']);
               if (response['status'] === 200 && ReceivingData.Status) {
                  const CryptoBytes  = CryptoJS.AES.decrypt(ReceivingData['Response'], 'SecretKeyOut@123');
                  const DecryptedData = JSON.parse(CryptoBytes.toString(CryptoJS.enc.Utf8));
                  this.Toastr.NewToastrMessage( { Type: 'Success', Message: 'New Institution Successfully Created' } );
                  this.onClose.next({Status: true, Response: DecryptedData});
                  this.bsModalRef.hide();
               } else if (response['status'] === 400 || response['status'] === 417 && !ReceivingData.Status) {
                  this.Toastr.NewToastrMessage( { Type: 'Error', Message: ReceivingData['Message'] } );
                  this.onClose.next({Status: false});
                  this.bsModalRef.hide();
               } else if (response['status'] === 401 || response['status'] === 417 && !ReceivingData.Status) {
                  this.Toastr.NewToastrMessage( { Type: 'Error', Message: ReceivingData['Message'] } );
                  this.onClose.next({Status: false});
                  this.bsModalRef.hide();
               } else {
                  this.Toastr.NewToastrMessage( { Type: 'Error', Message: 'Error Not Identify!, Creating Institution!' } );
                  this.onClose.next({Status: false, Message: 'UnExpected Error!'});
                  this.bsModalRef.hide();
               }
            });
         }
      }

   // Update New Institution
      update() {
         if (this.Form.valid && !this.Uploading) {
            this.Uploading = true;
            const Data = this.Form.value;
            let Info = CryptoJS.AES.encrypt(JSON.stringify(Data), 'SecretKeyIn@123');
            Info = Info.toString();
            this.FormData.set('Info', Info);
            this.Service.Institution_Update(this.FormData).subscribe( response => {
               this.Uploading = false;
               const ReceivingData = JSON.parse(response['_body']);
               if (response['status'] === 200 && ReceivingData.Status) {
                  const CryptoBytes  = CryptoJS.AES.decrypt(ReceivingData['Response'], 'SecretKeyOut@123');
                  const DecryptedData = JSON.parse(CryptoBytes.toString(CryptoJS.enc.Utf8));
                  this.Toastr.NewToastrMessage( { Type: 'Success', Message: 'Institution Successfully Updated' } );
                  this.onClose.next({Status: true, Response: DecryptedData});
                  this.bsModalRef.hide();
               } else if (response['status'] === 400 || response['status'] === 417 && !ReceivingData.Status) {
                  this.Toastr.NewToastrMessage( { Type: 'Error', Message: ReceivingData['Message'] } );
                  this.onClose.next({Status: false});
                  this.bsModalRef.hide();
               } else if (response['status'] === 401 && !ReceivingData.Status) {
                  this.Toastr.NewToastrMessage( { Type: 'Error', Message: ReceivingData['Message'] } );
                  this.onClose.next({Status: false});
                  this.bsModalRef.hide();
               } else {
                  this.Toastr.NewToastrMessage( { Type: 'Error', Message: 'Error Not Identify!, Updating Institution!' } );
                  this.onClose.next({Status: false});
                  this.bsModalRef.hide();
               }
            });
         }
      }
}
