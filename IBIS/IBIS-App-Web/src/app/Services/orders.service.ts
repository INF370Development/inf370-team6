import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, forkJoin, retry, tap, throwError,switchMap, Subject, BehaviorSubject } from 'rxjs';
import { Orders } from '../Models/Orders';
import { Product } from '../Models/Product';
import { Inventory } from '../Models/Inventory';
import { CustomerOrderLine } from '../Models/CustomerOrderLine';
import { SupplierOrderLine } from '../Models/SupplierOrderLine';
import { CustomerOrder } from '../Models/CustomerOrder';
import { SupplierOrder } from '../Models/SupplierOrder';
import { CustomerOrderViewModel } from '../Models/CustomerOrderViewModel';
import { SupplierOrderViewModel } from '../Models/SupplierOrderViewModel';
import { Category } from '../Models/Category';
import { environment } from 'src/environments/environment';
import { ProductViewModel } from '../Models/ProductViewModel';

@Injectable({
  providedIn: 'root'
})

export class OrdersService {
  apiUrl = environment.apiUrl + 'Order';
  productApiUrl = environment.apiUrl  + 'Products';
  inventoryApiUrl = environment.apiUrl + 'Item';
  customersApiUrl = environment.apiUrl +'Customers';
  suppliersApiUrl = environment.apiUrl +'Suppliers';
  manytoManyAPIUrl = environment.apiUrl +'ManyToMany';
  public addedOrder = new Subject<string>();
  public checkout = new BehaviorSubject<any>(null)
  public orderVM = new BehaviorSubject<any>(null)
  constructor(private httpClient: HttpClient) { }


  httpOptions = {
    headers: new HttpHeaders({
     'Content-Type': 'application/json'
     })
      }



      private handleError(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
          console.error('An error occurred:', error.error.message);
        } else {
          console.error(
            `Backend returned code ${error.status}, ` +
            `body was: ${error.error}`);
        }
        return throwError('Something bad happened; please try again later.'); 
      }
      
      
      
      
       createOrder(ord: Orders){
        return this.httpClient.post(this.apiUrl, ord, this.httpOptions)
      }
      PostPayFast(obj:any){
       let req = this.httpClient.post('https://sandbox.payfast.co.za​/eng/process?merchant_id=10000100&merchant_key=46f0cd694581a&amount=100.00&item_name=Order ID:6',obj)
       
        return this.httpClient.post('https://sandbox.payfast.co.za​/eng/process?merchant_id=10000100&merchant_key=46f0cd694581a&amount=100.00&item_name=Order ID:6',{

          headers: new HttpHeaders({
            'Content-Type': 'application/json'
          })
        })
      }
      
     getCurrency():any{
      let url = 'https://api.currencybeacon.com/v1/latest?api_key=FrWo45q23NJqHOVAbqny7GsgCvnJAZNN'
      return this.httpClient.get(url);
     }
     GenerateReviewsReport(){
      return this.httpClient.get(this.manytoManyAPIUrl + '/generateReviewsReport')
       
     }
    UpdateCustomerOrderStatus(item:CustomerOrder){
      return this.httpClient.put(this.manytoManyAPIUrl + '/putCustomerOrderStatus', item, this.httpOptions)
    }
    UpdateSupplierOrderStatus(item:SupplierOrder){
      return this.httpClient.put(this.manytoManyAPIUrl + '/putSupplierOrderStatus', item, this.httpOptions)
    }
    PostYoco(amount:any){
      let headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization':'Bearer 960bfde0VBrLlpK098e4ffeb53e1' });
        let options = { headers: headers };
        
      return this.httpClient.post('https://payments.yoco.com/api/checkouts',{'amount':4,'currency':'ZAR'},options)
      
    }
  
    
       getOrderList(): Observable<Orders> {
         return this.httpClient
         .get<Orders>(this.apiUrl + '/getAll')
           .pipe(
             retry(2),
             catchError(this.handleError)
           )
       }
       getProductViewModel(){
        return this.httpClient.get<ProductViewModel[]>(this.manytoManyAPIUrl + '/getProductVM')
       }
       getCustomerOrdersViewModel(){
        return this.httpClient.get<CustomerOrderViewModel[]>(this.manytoManyAPIUrl + '/getCustomerOrdersVM')
       }
       ConvertSupplierOrdersToExcel(){
        return this.httpClient.get(this.manytoManyAPIUrl + '/convertSupplierOrders')

       }
       ConvertCustomerOrdersToExcel(){
        return this.httpClient.get(this.manytoManyAPIUrl + '/convertCustomerOrders')
       }
       getCustomerOrderList(): Observable<any[]> {
         return this.httpClient
           .get<any[]>(this.apiUrl + '/getCustomerOrders')
           .pipe(
             retry(2),
             catchError(this.handleError)
           )
         
       }
   
       getSupplierOrderList(): Observable<SupplierOrder[]> {
        return this.httpClient
          .get<SupplierOrder[]>(this.apiUrl + '/getSupplierOrder')
          .pipe(
            retry(2),
            catchError(this.handleError)
          )
        
      }
      RecordReview(order:CustomerOrder): Observable<any[]> {
        return this.httpClient
          .post<any>(this.manytoManyAPIUrl + '/RecordReview',order)
          .pipe(
            retry(2),
            catchError(this.handleError)
          )
        
      }

       getCustomerOrderLine(customerOrder: any): Observable<CustomerOrderLine[]> {
        console.log(customerOrder)
         return this.httpClient
           .get<CustomerOrderLine[]>(this.apiUrl + '/getCustomerOrderLine')
           .pipe(
             retry(2),
             catchError(this.handleError)
           )
         
         
       }
       getSupplierOrderLine(id: any): Observable<SupplierOrderLine[]> {
        return this.httpClient
          .get<SupplierOrderLine[]>(this.apiUrl + '/getInventoryByOrder/' + id)
          .pipe(
            retry(2),
            catchError(this.handleError)
          )
        
      }
      getOrders():Observable<any>{
        return forkJoin([
          this.httpClient.get(this.apiUrl + '/getCustomerOrders').pipe(tap(res => console.log(res))),
          this.httpClient.get(this.apiUrl + '/getSupplierOrders').pipe(tap(res => console.log(res))),
          this.httpClient.get(this.customersApiUrl + '/getAll').pipe(tap(res => console.log(res))),
          this.httpClient.get(this.suppliersApiUrl + '/getAll').pipe(tap(res => console.log(res))),
          this.httpClient.get(this.apiUrl + '/getCustomerOrderLine').pipe(tap(res => console.log(res))),
          this.httpClient.get(this.apiUrl + '/getSupplierOrderLine').pipe(tap(res => console.log(res))),
          this.httpClient.get(this.productApiUrl + '/getAll').pipe(tap(res => console.log(res))),
          this.httpClient.get(this.inventoryApiUrl + '/getAll').pipe(tap(res => console.log(res))),

           
        ])
      }
      CreateCustomerOrder(customerOrderViewModel: CustomerOrderViewModel){ 
        
        return this.httpClient.post(this.manytoManyAPIUrl + '/PostCustomerOrder', customerOrderViewModel)
          
          }
          
        
      
        
        ;

          

          

       
      
      CreateSupplierOrder(ord: SupplierOrderViewModel){
        return this.httpClient.post(this.manytoManyAPIUrl + "/PostSupplierOrder", ord, this.httpOptions)
      }
      UpdateCustomerOrder( customerOrderViewModel: CustomerOrderViewModel): any {
        return this.httpClient
          .put(this.manytoManyAPIUrl + '/PutCustomerOrder', customerOrderViewModel)
          .pipe(
            retry(2),
            catchError(this.handleError)
          )
      }
      UpdateSupplierOrder( data: any): Observable<SupplierOrder> {
        return this.httpClient
          .put<SupplierOrder>(this.manytoManyAPIUrl + '/PutSupplierOrder' , data, this.httpOptions)
          .pipe(
            retry(2),
            catchError(this.handleError)
          )
      }
    
       getord(id: any): Observable<Orders> {
         return this.httpClient
           .get<Orders>(this.apiUrl + "/" +id)
           .pipe(
             retry(2),
             catchError(this.handleError)
           )
       }
      
       updateOrder(id: any, data: any): Observable<Orders> {
         return this.httpClient
           .put<Orders>(this.apiUrl + '/' + id, data, this.httpOptions)
           .pipe(
             retry(2),
             catchError(this.handleError)
           )
       }
      
       DeleteCustomerOrder(id:number):Observable<any>{
        // return forkJoin([
        //   this.httpClient.delete(this.apiUrl + '/DeleteCustomerOrder' + id).pipe(tap(res => console.log(res))),
        //   this.httpClient.delete(this.apiUrl + '/DeleteCustomerOrderLine' + id).pipe(tap(res => console.log(res))),
        // ])
        return this.httpClient.delete(this.manytoManyAPIUrl + '/deleteCustomerOrder/' + id).pipe(tap(res => console.log(res)))
     }
     DeleteSupplierOrder(id:number):Observable<any>{
      // return forkJoin([
      //   this.httpClient.delete(this.apiUrl + '/DeleteCustomerOrder' + id).pipe(tap(res => console.log(res))),
      //   this.httpClient.delete(this.apiUrl + '/DeleteCustomerOrderLine' + id).pipe(tap(res => console.log(res))),
      // ])
      return this.httpClient.delete(this.manytoManyAPIUrl + '/deleteSupplierOrder/' + id).pipe(tap(res => console.log(res)))
   }



    
       deleteOrder(id: string): Observable<any> {
        return this.httpClient.delete(`${this.apiUrl}/${id}` , this.httpOptions)
          .pipe(
            catchError(this.handleError)
          );
      }
}
