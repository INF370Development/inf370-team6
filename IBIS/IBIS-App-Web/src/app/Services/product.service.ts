import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { Product } from '../Models/Product';
import { Category } from '../Models/Category';
import { SubCategory } from '../Models/SubCategory';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  apiUrl = environment.apiUrl + 'Products';
  manytoManyAPIUrl = environment.apiUrl +'ManyToMany';

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
      
      
      
      
       createProduct(prod: Product){
        return this.httpClient.post(this.apiUrl, prod, this.httpOptions)
      }
  
    AddCategory(category:any): Observable<Category>{
      return this.httpClient.post<Category>(this.apiUrl + "/postCategory",category)
    }
    AddSubCategory(subCategory:any): Observable<Category>{
      return this.httpClient.post<Category>(this.apiUrl + "/postSubCategory",subCategory)
    }
    getCategoriesList(): Observable<Category[]> {
      return this.httpClient
        .get<Category[]>(this.apiUrl + '/getCategories')
        .pipe(
          retry(2),
          catchError(this.handleError)
        )
     }
     getSubCategoriesList(): Observable<SubCategory[]> {
      return this.httpClient
        .get<SubCategory[]>(this.apiUrl + '/getSubCategories')
        .pipe(
          retry(2),
          catchError(this.handleError)
        )
     }
     GenerateSubCategoryReportPDF(): Observable<any> {
      return this.httpClient
        .get<any>(this.manytoManyAPIUrl + '/GenerateSubCategoriesReportPDF')
        .pipe(
          retry(2),
          catchError(this.handleError)
        )
       
     }
     GenerateCategoryReportPDF(): Observable<any> {
      return this.httpClient
        .get<any>(this.manytoManyAPIUrl + '/GenerateCategoriesReportPDF')
        .pipe(
          retry(2),
          catchError(this.handleError)
        )
     }
     GenerateCategoryReportExcel(): Observable<any> {
      return this.httpClient
        .get<any>(this.manytoManyAPIUrl + '/GenerateCategoriesReportExcel')
        .pipe(
          retry(2),
          catchError(this.handleError)
        )
     }
     GenerateSubCategoryReportExcel(): Observable<any> {
      return this.httpClient
        .get<any>(this.manytoManyAPIUrl + '/GenerateSubCategoriesReportExcel')
        .pipe(
          retry(2),
          catchError(this.handleError)
        )
     }
    
       getProductList(): Observable<Product[]> {
         return this.httpClient
         .get<Product[]>(this.apiUrl + '/getAll')
           .pipe(
             retry(2),
             catchError(this.handleError)
           )
       }
    
       getprod(id: any): Observable<Product> {
         return this.httpClient
           .get<Product>(this.apiUrl + "/" +id)
           .pipe(
             retry(2),
             catchError(this.handleError)
           )
       }
      
       updateProduct(data: any): Observable<Product> {
         return this.httpClient
           .put<Product>(this.apiUrl + '/putProduct', data, this.httpOptions)
           .pipe(
             retry(2),
             catchError(this.handleError)
           )
       }
      
       delete(id:number){
        return this.httpClient.delete<Product>(`${this.apiUrl}/${id}` , this.httpOptions);
     }



    
       deleteProduct(id: string): Observable<any> {
        return this.httpClient.delete(`${this.apiUrl}/${id}` , this.httpOptions)
          .pipe(
            catchError(this.handleError)
          );
      }
     }





  

