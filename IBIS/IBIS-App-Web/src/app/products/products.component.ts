import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { DataSource } from '@angular/cdk/table';
import { Product } from '../Models/Product';
import { ProductService } from '../Services/product.service';
import { Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { ChartDataset, ChartType, ChartOptions } from 'chart.js';
import { Chart } from 'chart.js';

declare var myChart: any;


@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  data:any
  products: Product[] = [];
  idtodelete :any;
  search= "";
  productItems: any;
  itemNames: any;
  itemQuantities: any;

  constructor(private productService: ProductService,public router: Router,private toastController: ToastController) { 
    productService = {} as ProductService;
  }

  ngOnInit() {
    this.getProducts()
  }

  getProducts(){
    this.productService.getProductList().subscribe(response => {
      console.log(response);
      this.data = response;
    })
  }

  async delete(id: number){
    this.idtodelete = id;

    this.productService.delete(this.idtodelete).subscribe(Response => {
      console.log(Response);
      this.data = Response;
      this.presentToast('top')
      this.getProducts();
    })
  }


  addproduct(){
    this.router.navigate(['/add-product']);
  }

  viewWriteoffs(){
    this.router.navigate(['/view-write-offs']);
  }


  async presentToast(position: 'top' | 'middle' | 'bottom') {
    const toast = await this.toastController.create({
      message: 'Product successfully removed',
      duration: 5000,
      position: position,
      color: 'success'
    });

    await toast.present();
  }

  generateReport(){
    this.productService.getProductList().subscribe(
      (res) => {
        this.productItems = res;
        this.itemNames = this.productItems.data.products.map((products: any) => products.Name); 
        this.itemQuantities = this.productItems.data.products.map((products: any) => products.Quantity);
        console.log(this.itemNames);
        console.log(this.itemQuantities);


        // for(const item in productItems){
        //   itemNames.push(item.Name || '')
        //   itemQuantities.push(item.Quantity || 0)
        // }
        
        this.router.navigate(['/Product-Report'],{
          queryParams: {
            itemNames: JSON.stringify(this.itemNames),
            itemQuantities: JSON.stringify(this.itemQuantities)
          }                         //pass data to product-report page using queryParams//
        });
      },
      (error)=>{
        console.error('Error fetching product data:', error);
      }
    );
  }

 
}

