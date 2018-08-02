import { Component, OnInit } from '@angular/core';

import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

@Component({
  selector: 'app-model-edit-question-answers',
  templateUrl: './model-edit-question-answers.component.html',
  styleUrls: ['./model-edit-question-answers.component.css']
})
export class ModelEditQuestionAnswersComponent implements OnInit {

   _Colleges: any[] = [ 'SNS College of Technology',
                        'SNS College of Engineering',
                        'SNS College of Ars and Science',
                        'SNS College of Education',
                        'SNS Academy',
                     ];
   _Departments: any[] = [
                           'Aeronautical Engineering',
                           'Agriculture Engineering',
                           'Automobile Engineering',
                           'Biomedical Engineering',
                           'Civil Engineering',
                           'Civil Engineering and Planning',
                           'Computer Science Engineering',
                           'Electrical and Electronics Engineering',
                           'Electronics and Communication Engineering',
                           'Electronics and Instrumentation Engineering',
                           'Information Technology',
                           'Mechanical Engineering',
                           'Mechanical and Automation Engineering',
                           'Mechatronics Engineering',
                           'Master of Business Administration',
                           'Master of Computer Application',
                           'Science & Humanities',
                           'Department of Physical Education',
                        ];
   _Categories: any[] = ['One', 'Two', 'Three'];

   Type: String;

   constructor(public bsModalRef: BsModalRef) { }

   ngOnInit() {
   }

}
