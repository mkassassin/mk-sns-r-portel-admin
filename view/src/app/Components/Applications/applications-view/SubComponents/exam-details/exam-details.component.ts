import { Component, OnInit, Input, TemplateRef } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { Router, ActivatedRoute } from '@angular/router';

import { FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';

import * as CryptoJS from 'crypto-js';
import {NativeDateAdapter} from '@angular/material';
import {DateAdapter} from '@angular/material/core';
export class MyDateAdapter extends NativeDateAdapter {
   format(date: Date, displayFormat: Object): string {
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
   }
}


import { ToastrService } from './../../../../../Services/common-services/toastr-service/toastr.service';
import { CandidatesService } from './../../../../../Services/Applications/candidates.service';
import { LoginService } from './../../../../../Services/LoginService/login.service';

@Component({
  selector: 'app-exam-details',
  templateUrl: './exam-details.component.html',
  styleUrls: ['./exam-details.component.css'],
  providers: [{provide: DateAdapter, useClass: MyDateAdapter}],
})
export class ExamDetailsComponent implements OnInit {

   @Input() CandidateData: Object;

   UpdateOptions: any[] = ['Shortlisted', 'Rejected'];

   User_Id: any;
   Application_Management: any;
   OnlineExam_Management: any;
   GD_Management: any;
   Technical_Management: any;
   Hr_Management: any;
   Candidate_Id: any;

   If_Pass: Boolean = false;
   If_PassOne: Boolean = false;
   MinDate: Date = new Date();

   Exam_Data = {};

   Uploading: Boolean = false;
   Form: FormGroup;
   FormOne: FormGroup;
   FormTwo: FormGroup;
   FormThree: FormGroup;

   modalRef: BsModalRef;

  constructor( public Service: CandidatesService,
               private active_route: ActivatedRoute,
               private Toastr: ToastrService,
               public Login_Service: LoginService,
               private modalService: BsModalService
            ) {   this.User_Id = this.Login_Service.LoginUser_Info()['_id'];

                  this.Application_Management = this.Login_Service.LoginUser_Info()['ApplicationManagement_Permission'];
                  this.OnlineExam_Management = this.Login_Service.LoginUser_Info()['OnlineExamUpdate_Permission'];
                  this.GD_Management = this.Login_Service.LoginUser_Info()['GD_Permission'];
                  this.Technical_Management = this.Login_Service.LoginUser_Info()['Technical_Permission'];
                  this.Hr_Management = this.Login_Service.LoginUser_Info()['Hr_Permission'];

                  this.active_route.url.subscribe((u) => {
                     this.Candidate_Id = this.active_route.snapshot.params['Candidate_Id'];
                     const Data = {'User_Id' : this.User_Id, Candidate_Id: this.Candidate_Id };
                     let Info = CryptoJS.AES.encrypt(JSON.stringify(Data), 'SecretKeyIn@123');
                     Info = Info.toString();
                     this.Service.Candidate_ExamView({ 'Info': Info }).subscribe(response => {
                        const ResponseData = JSON.parse(response['_body']);
                        if (response['status'] === 200 && ResponseData['Status'] ) {
                           const CryptoBytes  = CryptoJS.AES.decrypt(ResponseData['Response'], 'SecretKeyOut@123');
                           const DecryptedData = JSON.parse(CryptoBytes.toString(CryptoJS.enc.Utf8));
                           this.Exam_Data = DecryptedData;
                           this.Exam_Data['ExamConfig']['Config'] = this.Exam_Data['ExamConfig']['Config'].map(obj => {
                                                                        obj.Answered = 0;
                                                                        obj.CorrectAnswer = 0;
                                                                        const Filter_Arr = this.Exam_Data['Questions'].filter(obj_1 => obj_1.Category === obj.Category['_id']);
                                                                        Filter_Arr.map(obj_1 => {
                                                                           if (obj_1.Status === 'Answered') {
                                                                              obj.Answered = obj.Answered + 1;
                                                                           }
                                                                           if (obj_1.Answer === obj_1.CandidateAnswer) {
                                                                              obj.CorrectAnswer = obj.CorrectAnswer + 1;
                                                                           }
                                                                        });
                                                                        return obj;
                                                                     });
                           this.Form.controls['Exam_Id'].setValue(this.Exam_Data['_id']);
                           this.FormOne.controls['Exam_Id'].setValue(this.Exam_Data['_id']);
                           this.FormTwo.controls['Exam_Id'].setValue(this.Exam_Data['_id']);
                           this.FormThree.controls['Exam_Id'].setValue(this.Exam_Data['_id']);
                        } else if (response['status'] === 400 || response['status'] === 417 && !ResponseData['Status']) {
                           this.Toastr.NewToastrMessage({ Type: 'Error', Message: ResponseData['Message'] });
                        } else if (response['status'] === 401 && !ResponseData['Status']) {
                           this.Toastr.NewToastrMessage({ Type: 'Error', Message: ResponseData['Message'] });
                        } else {
                           this.Toastr.NewToastrMessage({ Type: 'Error', Message: 'Creating Customer Getting Error!, But not Identify!' });
                        }
                     });
                  });
               }

   ngOnInit() {
      this.Form = new FormGroup({
         Candidate_Id: new FormControl(this.Candidate_Id, Validators.required ),
         User_Id: new FormControl(this.User_Id, Validators.required ),
         Exam_Id: new FormControl('', Validators.required ),
         ExamResult: new FormControl(null, Validators.required ),
         Created_By: new FormControl( this.User_Id, Validators.required ),
      });
      this.FormOne = new FormGroup({
         Candidate_Id: new FormControl(this.Candidate_Id, Validators.required ),
         User_Id: new FormControl(this.User_Id, Validators.required ),
         Exam_Id: new FormControl('', Validators.required ),
         GroupDiscussionResult: new FormControl(null, Validators.required ),
         GroupDiscussionDescription: new FormControl(''),
         Created_By: new FormControl( this.User_Id, Validators.required ),
      });
      this.FormTwo = new FormGroup({
         Candidate_Id: new FormControl(this.Candidate_Id, Validators.required ),
         User_Id: new FormControl(this.User_Id, Validators.required ),
         Exam_Id: new FormControl('', Validators.required ),
         TechnicalResult: new FormControl(null, Validators.required ),
         TechnicalDescription: new FormControl(''),
         Created_By: new FormControl( this.User_Id, Validators.required ),
      });
      this.FormThree = new FormGroup({
         Candidate_Id: new FormControl(this.Candidate_Id, Validators.required ),
         User_Id: new FormControl(this.User_Id, Validators.required ),
         Exam_Id: new FormControl('', Validators.required ),
         HrInterviewResult: new FormControl(null, Validators.required ),
         HrInterviewDescription: new FormControl(''),
         InterviewResult: new FormControl(null, Validators.required ),
         InterviewDescription: new FormControl(''),
         Created_By: new FormControl( this.User_Id, Validators.required ),
      });
   }

   NotAllow(): Boolean {
      return false;
   }

   openModal(template: TemplateRef<any>) {
      this.modalRef = this.modalService.show(template);
   }
   openLargeModal(template: TemplateRef<any>) {
      this.modalRef = this.modalService.show(template, Object.assign({}, { class: 'modal-lg' }));
   }

   ResultChange() {
      const Result = this.Form.value.ExamResult;
      if (Result === 'Pass' || Result === 'Shortlisted') {
         this.If_Pass = true;
         this.Form.addControl('InterviewDate', new FormControl(null, Validators.required));
         this.Form.addControl('InterviewTime', new FormControl(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }), Validators.required));
         this.Form.addControl('Place', new FormControl('', Validators.required));
      } else {
         this.If_Pass = false;
         this.Form.removeControl('InterviewDate');
         this.Form.removeControl('InterviewTime');
         this.Form.removeControl('Place');
      }
   }

   InterviewResultChange() {
      const Result = this.FormThree.value.InterviewResult;
      if (Result === 'Pass' || Result === 'Shortlisted') {
         this.If_PassOne = true;
         this.FormThree.addControl('JoinDate', new FormControl(null, Validators.required));
      } else {
         this.If_PassOne = false;
         this.FormThree.removeControl('JoinDate');
      }
   }

   formatDate(date) {
      const d = new Date(date);
      let month = '' + (d.getMonth() + 1);
      let day = '' + d.getDate();
      const year = d.getFullYear();
      if (month.length < 2) { month = '0' + month; }
      if (day.length < 2) { day = '0' + day; }
      return [year, month, day].join('-');
   }

   convertTime12to24(time12h) {
      if (time12h !== null && time12h !== '') {
         const [time, modifier] = time12h.split(' ');
         const newTime = time.split(':');
         if (newTime[0] === '12') { newTime[0] = '00'; }
         if (modifier === 'pm') { newTime[0] = parseInt(newTime[0], 10) + 12; }
         return newTime[0] + ':' + newTime[1] + ':00';
      } else {
         return '00:00:00';
      }
   }

   onSubmit() {
      if (this.Form.valid) {

         if (this.Form.value.ExamResult  === 'Shortlisted' || this.Form.value.ExamResult === 'Pass') {
            this.Form.controls['InterviewTime'].setValue(this.Form.controls['InterviewTime'].value.toLowerCase());
            const ODate = this.Form.controls['InterviewDate'].value;
            const OTime = this.Form.controls['InterviewTime'].value;
            this.Form.controls['InterviewDate'].setValue(new Date(this.formatDate(ODate) + ' ' + this.convertTime12to24(OTime)));
         }
         this.Uploading = true;
         let Info = CryptoJS.AES.encrypt(JSON.stringify(this.Form.value), 'SecretKeyIn@123');
         Info = Info.toString();
         this.Service.ExamResult_Update({ 'Info': Info }).subscribe(response => {
            this.Uploading = false;
            this.modalRef.hide();
            const ResponseData = JSON.parse(response['_body']);
            if (response['status'] === 200 && ResponseData['Status'] ) {
               const CryptoBytes  = CryptoJS.AES.decrypt(ResponseData['Response'], 'SecretKeyOut@123');
               const DecryptedData = JSON.parse(CryptoBytes.toString(CryptoJS.enc.Utf8));
               this.Exam_Data = DecryptedData;
               this.Exam_Data['ExamConfig']['Config'] = this.Exam_Data['ExamConfig']['Config'].map(obj => {
                                                            obj.Answered = 0;
                                                            obj.CorrectAnswer = 0;
                                                            const Filter_Arr = this.Exam_Data['Questions'].filter(obj_1 => obj_1.Category === obj.Category['_id']);
                                                            Filter_Arr.map(obj_1 => {
                                                               if (obj_1.Status === 'Answered') {
                                                                  obj.Answered = obj.Answered + 1;
                                                               }
                                                               if (obj_1.Answer === obj_1.CandidateAnswer) {
                                                                  obj.CorrectAnswer = obj.CorrectAnswer + 1;
                                                               }
                                                            });
                                                            return obj;
                                                         });
               this.CandidateData['Current_Stage'] = 'Stage_5';
            } else if (response['status'] === 400 || response['status'] === 417 && !ResponseData['Status']) {
               this.Toastr.NewToastrMessage({ Type: 'Error', Message: ResponseData['Message'] });
            } else if (response['status'] === 401 && !ResponseData['Status']) {
               this.Toastr.NewToastrMessage({ Type: 'Error', Message: ResponseData['Message'] });
            } else {
               this.Toastr.NewToastrMessage({ Type: 'Error', Message: 'Creating Customer Getting Error!, But not Identify!' });
            }
         });
      }
   }

   GdSubmit() {
      if (this.FormOne.valid) {
         this.Uploading = true;
         let Info = CryptoJS.AES.encrypt(JSON.stringify(this.FormOne.value), 'SecretKeyIn@123');
         Info = Info.toString();
         this.Service.GDResult_Update({ 'Info': Info }).subscribe(response => {
            this.Uploading = false;
            this.modalRef.hide();
            const ResponseData = JSON.parse(response['_body']);
            if (response['status'] === 200 && ResponseData['Status'] ) {
               const CryptoBytes  = CryptoJS.AES.decrypt(ResponseData['Response'], 'SecretKeyOut@123');
               const DecryptedData = JSON.parse(CryptoBytes.toString(CryptoJS.enc.Utf8));
               this.Exam_Data = DecryptedData;
               this.CandidateData['Current_Stage'] = 'Stage_6';
            } else if (response['status'] === 400 || response['status'] === 417 && !ResponseData['Status']) {
               this.Toastr.NewToastrMessage({ Type: 'Error', Message: ResponseData['Message'] });
            } else if (response['status'] === 401 && !ResponseData['Status']) {
               this.Toastr.NewToastrMessage({ Type: 'Error', Message: ResponseData['Message'] });
            } else {
               this.Toastr.NewToastrMessage({ Type: 'Error', Message: 'Creating Customer Getting Error!, But not Identify!' });
            }
         });
      }
   }


   TechnicalSubmit() {
      if (this.FormTwo.valid) {
         this.Uploading = true;
         let Info = CryptoJS.AES.encrypt(JSON.stringify(this.FormTwo.value), 'SecretKeyIn@123');
         Info = Info.toString();
         this.Service.TechnicalResult_Update({ 'Info': Info }).subscribe(response => {
            this.Uploading = false;
            this.modalRef.hide();
            const ResponseData = JSON.parse(response['_body']);
            if (response['status'] === 200 && ResponseData['Status'] ) {
               const CryptoBytes  = CryptoJS.AES.decrypt(ResponseData['Response'], 'SecretKeyOut@123');
               const DecryptedData = JSON.parse(CryptoBytes.toString(CryptoJS.enc.Utf8));
               this.Exam_Data = DecryptedData;
               this.CandidateData['Current_Stage'] = 'Stage_7';
            } else if (response['status'] === 400 || response['status'] === 417 && !ResponseData['Status']) {
               this.Toastr.NewToastrMessage({ Type: 'Error', Message: ResponseData['Message'] });
            } else if (response['status'] === 401 && !ResponseData['Status']) {
               this.Toastr.NewToastrMessage({ Type: 'Error', Message: ResponseData['Message'] });
            } else {
               this.Toastr.NewToastrMessage({ Type: 'Error', Message: 'Creating Customer Getting Error!, But not Identify!' });
            }
         });
      }
   }


   InterviewSubmit() {
      if (this.FormThree.valid) {
         this.Uploading = true;
         let Info = CryptoJS.AES.encrypt(JSON.stringify(this.FormThree.value), 'SecretKeyIn@123');
         Info = Info.toString();
         this.Service.InterviewResult_Update({ 'Info': Info }).subscribe(response => {
            this.Uploading = false;
            this.modalRef.hide();
            const ResponseData = JSON.parse(response['_body']);
            if (response['status'] === 200 && ResponseData['Status'] ) {
               const CryptoBytes  = CryptoJS.AES.decrypt(ResponseData['Response'], 'SecretKeyOut@123');
               const DecryptedData = JSON.parse(CryptoBytes.toString(CryptoJS.enc.Utf8));
               this.Exam_Data = DecryptedData;
               this.CandidateData['Current_Stage'] = 'Stage_8';
            } else if (response['status'] === 400 || response['status'] === 417 && !ResponseData['Status']) {
               this.Toastr.NewToastrMessage({ Type: 'Error', Message: ResponseData['Message'] });
            } else if (response['status'] === 401 && !ResponseData['Status']) {
               this.Toastr.NewToastrMessage({ Type: 'Error', Message: ResponseData['Message'] });
            } else {
               this.Toastr.NewToastrMessage({ Type: 'Error', Message: 'Creating Customer Getting Error!, But not Identify!' });
            }
         });
      }
   }

}
