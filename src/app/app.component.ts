import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, of, from, fromEvent, Subscription, Subject, ConnectableObservable } from 'rxjs';
import { map, filter, tap, switchMap, debounceTime, shareReplay, share, multicast } from 'rxjs/operators'
import { ajax } from 'rxjs/ajax'  

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy{
  @ViewChild('input', {static: true}) input?: ElementRef<HTMLInputElement>

  users:any = []
  sub?: Subscription

  ngOnInit(){
    const inputObs = fromEvent(this.input!.nativeElement, "input")
    .pipe( 
      
      // // tap((e: any)=> {
      // //   if(e.target.value!=""){
      // //     throw new Error("Error Getting Api - Subscription cancelled")
      // //   }
      // // }),

      debounceTime(1000),
      filter((e: any)=> e.target.value != ''),
      // map((v: any)=> v.target.value)
      switchMap((e: any)=>{
        return ajax(`https://api.github.com/search/users?q=${e.target.value}`)
      }),
      map((ajaxResponse: any) => ajaxResponse.response.items)
    )

    this.sub = inputObs.subscribe({
      next: (value:any)=>{
        console.log(value);
        this.users = value
      },
      error: (err: any) => console.log(err.message)
  })

    //Promise doesn't allow mutliple data
    //Observble allows multiple data
    // const promise = new Promise((res, rej)=>{
    //   res({name: "Sam", email: "sam@"})
    //   res({name: "Ram", email: "ram@"})
    // })
    
    // promise.then((value:any)=>{
    //   console.log(value.name, value.email)
    // })

    const subject = new Subject<any>()

    //Observable -> Emits data/s
    //CREATING OBSERVABLES FROM SCRATCH
    const observable = new Observable((subscriber) =>{
      // setTimeout(()=>{
        console.log("Inside Observable")
        subscriber.next({name: "Kim", email: "kim@", isLoggedIn: true});
      // }, 1000)
      // subscriber.next({name: "Rick", email: "rick@", isLoggedIn: true});
      // subscriber.next({name: "Erik", email: "erik@", isLoggedIn: false});
      // subscriber.next({name: "Pratik", email: "pratik@", isLoggedIn: true});
      subscriber.complete();
      subscriber.next({name: "Mark", email: "mark@", isLoggedIn: true});

    })

    //USING 'of' WHICH RETURNS OBSERVABLES
    // const ofObs = of(
    //   {name: "Kim1", email: "kim1@", isLoggedIn: true},
    //   {name: "Rick1", email: "rick1@", isLoggedIn: true},
    //   {name: "Erik1", email: "erik1@", isLoggedIn: false},
    //   {name: "Pratik1", email: "pratik1@", isLoggedIn: true}
    // )

    // USING 'from' WHICH RETURNS OBSERVABLES BUT FOR ARRAYS SINCE 'of' DOESN'T PRINTS EACH VALUE OF ARRAY BUT ENTRE ARRAY
    // const fromObs = from([
    //   {name: "Kim2", email: "kim2@", isLoggedIn: true},
    //   {name: "Rick2", email: "rick2@", isLoggedIn: true},
    //   {name: "Erik2", email: "erik2@", isLoggedIn: false},
    //   {name: "Pratik2", email: "pratik2@", isLoggedIn: true}
    // ])
    .pipe(
      tap((value: any)=> {
        // if(value.isLoggedIn == false){
        //   throw new Error("User not Logged in - Subscription ends")
        // }
        console.log("Inside Pipe")
      }),
      filter((value: any)=> value.isLoggedIn==true),
      map((value: any)=> value.name),
      // share()
      // shareReplay()
      // multicast(subject)
    ) as ConnectableObservable<any>
    
    //Observer/Subscriber -> Consumes data/s
    //SUBSCIRBER 1
    observable.subscribe({
      next: (value) => console.log(`Emitted Data: Logged In User-> `, value),
      
      error: (err) => console.log(err.message),
      complete: ()=> console.log("Subscription is finished")
    })

    //SUBSCIRBER 2
    observable.subscribe({
      next: (value) => console.log(`Emitted Data: Logged In User-> `, value),
      
      error: (err) => console.log(err.message),
      complete: ()=> console.log("Subscription is finished")
    })

    // observable.connect()

  }


  ngOnDestroy(){
    if(this.sub){
      this.sub.unsubscribe();
    }
  }
}
