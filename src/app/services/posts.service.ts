import { Injectable } from '@angular/core';
import { Post } from "../models/Post.model";
import { Subject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class PostsService {

  posts: Post[] = []
  postUpdated = new Subject<{posts: Post[], postCount: number}>()

  constructor(private http: HttpClient, private router: Router) { }


  getPosts(postPerpage: number, currentPage: number){
    const queryParams = `?pagesize=${postPerpage}&page=${currentPage}`
    this.http.get<{message: string, maxPosts: number , posts: any}>('http://localhost:3000/api/post'+ queryParams)
    .pipe(map(postData => {
      return {posts: postData.posts.map(post =>{
        return {
          title: post.title,
          content: post.content,
          id: post._id,
          imagePath: post.imgPath
        }
      }), maxPosts: postData.maxPosts}
    }))
    .subscribe(transformedPostData => {
      this.posts = transformedPostData.posts;
      this.postUpdated.next({posts:[...this.posts], postCount: transformedPostData.maxPosts})
    });
  }

  getPostsUpdateListener(){
    return this.postUpdated.asObservable()
  }

  getPost(id: string){;
    return this.http.get<{_id: string, title: string, content: string, imgPath: string}>('http://localhost:3000/api/post/'+id)
  }

  addPost(title: string, content: string, image: File){
    const postData = new FormData()
    postData.append("title", title)
    postData.append("content", content)
    postData.append("image", image, title)
    this.http.post<{message: string, post: Post}>('http://localhost:3000/api/post', postData).subscribe(postData =>{
      this.router.navigate(['/'])
    })

  }


  deletePost(postId: string){
    return this.http.delete('http://localhost:3000/api/post/'+postId);
  }


  updatePost(id: string, title: string, content: string, image: File | string){
    //const post: Post = {id: id, title: title, content: content, imagePath: null}
    let postData: Post | FormData
    if(typeof(image) == 'object'){
      postData = new FormData()
      postData.append('id', id)
      postData.append('title', title)
      postData.append('content', content)
      postData.append('image', image, title)
    }else {
      postData = {
        id: id, 
        title: title, 
        content: content, 
        imagePath: image
      }
    }
    this.http.put('http://localhost:3000/api/post/'+id, postData).subscribe(res => {
      this.router.navigate(['/'])
      
    })
  }
}
