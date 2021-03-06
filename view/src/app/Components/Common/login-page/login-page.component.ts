import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

import * as CryptoJS from 'crypto-js';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { LoginService } from './../../../Services/LoginService/login.service';
import { ForgotPasswordComponent } from '../../../Models/forgot-password/forgot-password.component';

import { ToastrService } from './../../../Services/common-services/toastr-service/toastr.service';


@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {

   LoginForm: FormGroup;

   Data_1;

   bsModalRef: BsModalRef;

   UserRequired: Boolean = false;
   UserMinLengthErr: Boolean = false;

   constructor(
      private router: Router,
      private service: LoginService,
      private modalService: BsModalService,
      private Toastr: ToastrService,
   ) { }

   ngOnInit() {
      this.LoginForm = new FormGroup({
         User_Name: new FormControl('', Validators.required),
         User_Password: new FormControl('', Validators.required),
      });
   }

   ForgotPassword() {
      const initialState = { };
      this.bsModalRef = this.modalService.show(ForgotPasswordComponent, Object.assign({initialState}, { ignoreBackdropClick: true, class: '' }));
   }

   submit() {
      if (this.LoginForm.valid) {
            const Data = this.LoginForm.value;
            let Info = CryptoJS.AES.encrypt(JSON.stringify(Data), 'SecretKeyIn@123');
            Info = Info.toString();
            this.service.User_Login_Validate({'Info': Info}).subscribe( response => {
               const ReceivingData = JSON.parse(response['_body']);
               if (response['status'] === 200 && ReceivingData.Status) {
                  this.router.navigate(['/Applications']);
               } else if (response['status'] === 200 && !ReceivingData.Status) {
                  this.Toastr.NewToastrMessage( { Type: 'Error', Message: ReceivingData.Message } );
               } else if (response['status'] === 400 && !ReceivingData.Status) {
                  this.Toastr.NewToastrMessage( { Type: 'Error', Message: ReceivingData.Message } );
               } else if (response['status'] === 417 && !ReceivingData.Status) {
                  this.Toastr.NewToastrMessage( { Type: 'Error', Message: ReceivingData.Message } );
               } else {
                  this.Toastr.NewToastrMessage( { Type: 'Error', Message: 'Some Error Occurred!, Error Not Defined!' } );
               }
            });
      }
   }

}
