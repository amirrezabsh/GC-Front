import {Component, Inject, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {CommentsComponent} from "../comments/comments.component";
import {PublicService} from '../public.service';
import { SuccessDialogComponent } from '../success-dialog/success-dialog.component';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component'

export interface DialogData {
  title: string;
  poster: string;
  description: string;
  link: string;
  team: string;
  creators: [];
  likes: []
  is_verified: boolean;
  timestamp: string;
  game_code: number;
  average_score: number;
  dialogInstance: any;
}

@Component({
  selector: 'app-game-content',
  templateUrl: './game-content.component.html',
  styleUrls: ['./game-content.component.scss']
})
export class GameContentComponent implements OnInit {
  comments: any
  showComments: boolean = false

  commentToSubmit: {
    text: string,
  } = {
    text: "",
  }

  isLiked: boolean = false

  constructor(
    public publicservice: PublicService,
    public matDialog: MatDialog,
    public dialog: MatDialogRef<GameContentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    if(this.publicservice.logedIn){
      this.publicservice.getUser().then((r) => {
        console.log(r.data)
        // this.publicservice.loggedInUserEmail = r.data.email;
        console.log("==============")
        const userEmail = r.data.email
        console.log(this.data.likes)
        console.log(userEmail)
        console.log("==============")
        const gameIsLikeByUser = this.data.likes.some(like => 
        { 
          console.log(like['user']['email'])
          return like['user']['email'] === userEmail
        })
        
        console.log(gameIsLikeByUser)
        this.isLiked = gameIsLikeByUser
    });
    }
  }

  ngOnInit(): void {
    // this.publicservice.currentGame.averageScore = 0;
    this.comments = []
    this.publicservice.getComments(this.data.game_code).subscribe(res=>{
        let comments = this.publicservice.extractData(res, this)
        comments = comments.map(element => {
          element['user']['name'] = element['user']['first_name']
    
          return element
        })
        console.log("==================> here")
        this.comments=comments
      })
  }

  openGameDialog() {
    const dialog = this.matDialog.open(CommentsComponent, {
      data: {
        game_code: 2
      },
    });

    dialog.afterClosed().subscribe(result => {
    });
  }

  openComments() {
    this.showComments = true
  }

  closeComments() {
    this.showComments = false
  }

  submitComment() {
    // TODO API call to backend
    console.log("current game is", this.data)
    console.log("typed comment is", this.commentToSubmit.text)

    const body = {
      text: this.commentToSubmit.text,
      game: this.data.game_code,
    }

    this.publicservice.submitComment(body).subscribe(res =>{
      console.log("comment was submitted", res)
      this.commentToSubmit = {
        text: "",
      }
      this.showComments = false;

      this.data.dialogInstance.closeAll()
      this.publicservice.snackbar
      this.publicservice.snackbar.openFromComponent(SuccessDialogComponent, { duration: 2000, data: 'نظر شما با موفقیت ثبت شد!', panelClass: ['snackbar'], verticalPosition: 'top', direction: 'rtl' });

      // TODO show success dialog to the user
    }, error => {
      console.log("====================")
      console.log(error)
      
      console.log("====================###")
      console.log(error["_body"]["error"])
      if(error["_body"] && error["_body"].includes("The fields user, game must make a unique set")){
        console.log("shitttttttttttttt==========>")
        this.publicservice.snackbar.openFromComponent(ErrorDialogComponent, { duration: 2000, data: 'شما قبلا نظر داده‌اید!', panelClass: ['snackbar'], verticalPosition: 'top', direction: 'rtl' });
      }else{
        this.publicservice.snackbar.openFromComponent(ErrorDialogComponent, { duration: 2000, data: 'مشکلی پیش آمده: لطفا مجددا تلاش نمایید!', panelClass: ['snackbar'], verticalPosition: 'top', direction: 'rtl' });
      }
    })


  }
  handleFav() {
    this.isLiked = !this.isLiked
  }
}


