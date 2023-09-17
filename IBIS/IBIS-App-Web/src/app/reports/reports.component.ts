import { Component, OnInit } from '@angular/core';
import { Ng2SearchPipe } from 'ng2-search-filter';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../Services/product.service';
import { Product } from '../Models/Product';
import { InventoryService } from '../Services/inventory.service';
import { SupplierService } from '../Services/supplier.service';
import { OrdersService } from '../Services/orders.service';
import { WriteOffService } from '../Services/write-off.service';
import { Chart,registerables } from 'chart.js';
import { Orders } from '../Models/Orders';
import { CustomerOrder } from '../Models/CustomerOrder';
import { DatePipe } from '@angular/common';
import { CustomerOrderVM } from '../Models/CustomerOrderVM';
import { ProductViewModel } from '../Models/ProductViewModel';
var pdfMake = require('pdfmake/build/pdfmake');
var pdfFonts = require('pdfmake/build/vfs_fonts');
pdfMake.vfs = pdfFonts.pdfMake.vfs;


class Invoice{
  customerName= 'Johnny';
  address= '74 riding st';
  contactNo = 982734786;
  email= 'John@gmail';
  
  products: Product[] = [];
  additionalDetails!: string;
  
  
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  dataInventory:any
  dataProduct:any
  dataSupplier:any
  dataOrder:any
  dataWriteOff:any
  filterTerm!: string;
  customerOrdersChart:any
  customerOrders:any
  supplierOrders:any
  customerOrderLine:any
  supplierOrderLine:any
  isCustomerOrder:any = false
  supplierOrdersChart:any
  chart:any
  dropDown:any = []
  selectedValue:any
  selectedProduct:any
  filtereredCustomerOrders:any
  ordersTotal:any
  customerOrdersVM:CustomerOrderVM[]|any
  period:any
  request:any
  products:ProductViewModel[]|any
  
  combinedData: { Name: string, Quantity: number, Price: number }[] = [];
  constructor(private productService: ProductService, private route: ActivatedRoute,
     private inv : InventoryService,private supply: SupplierService,private orderservice : OrdersService, private writeOffService : WriteOffService
     ,public orderService:OrdersService) {
      Chart.register(...registerables);
      }

  ngOnInit() {
    this.orderService.getOrders().subscribe(response => {
      console.log(response)
     this.customerOrders = response[0]
     this.supplierOrders = response[1]
     this.customerOrderLine = response[4]
     this.supplierOrderLine = response[5]
     console.log(this.customerOrders)
     console.log(this.supplierOrders)
    })

   // this.getInventory();
    this.getProducts();
    this.getSuppliers();
    //this.getOrders();
    this.getCustomerOrdersViewModel()
    //this.getwriteOffs();
   this.PopulateDropDown();
   this.GetProductVM()
   


    this.route.queryParams.subscribe((params) => {
      this.combinedData = JSON.parse(params['combinedData'] || '[]');
      // const combinedData: { Name: string, Quantity: number }[] = JSON.parse(params['combinedData'] || '[]');
      const itemNames: string[] = this.combinedData.map(item => item.Name);
      const itemQuantities: number[] = this.combinedData.map(item => item.Quantity);
      const itemPrices: number[] = this.combinedData.map(item =>item.Price )
      console.log('yes we received the data from the product component', this.combinedData)
      
    });
  }
  ExportToExcel(){
    if(this.isCustomerOrder){
      this.orderService.ConvertCustomerOrdersToExcel().subscribe(response =>{
        
      })
    }else{
      this.orderService.ConvertSupplierOrdersToExcel().subscribe(response =>{
      })
    }
  }
  Confirm(){
    if(this.request =='order'){
      this.DatedOrdersReport()
    }else if(this.request == 'stock'){
      this.CreateStockTakeChart()
    }
  }
 
  async GetProductVM(){
    let value = new Promise((resolve, reject) => {
      this.orderService.getProductViewModel().subscribe(response => {
        console.log(response)
        this.products = response
        resolve(response)
      }),(error:any) => {
        reject(error)
      }
      
    })
    await value
    return value
  }
  PopulateDropDown(){
    
    let date = new Date()
    let monthNumber = date.getMonth()
    let year = date.getFullYear()
    for(let i = 1; i <= 6; i++){
      const date = new Date();
      date.setMonth(monthNumber);
      if(monthNumber == 0){
        monthNumber = 12
        year--
      }
      let month = date.toLocaleString([], { month: 'long' });
      
      this.dropDown.push({'value': month+' '+year,'monthNumber':monthNumber,'year':year}) // filled out for me...
      monthNumber--
    }
   console.log(this.dropDown)

  }
  DatedOrdersReport(){
    this.getCustomerOrdersViewModel().then(response => {
        let dropDownIndex = this.dropDown.findIndex((item:any) => item.monthNumber == this.selectedValue)
        console.log(dropDownIndex)
    let selectedPeriod = this.dropDown[dropDownIndex]
    const date = new Date();
    date.setMonth(selectedPeriod.monthNumber);
    let startOfPeriod = new Date(selectedPeriod.year, selectedPeriod.monthNumber, 1)
    let endOfPeriod = new Date(selectedPeriod.year, selectedPeriod.monthNumber + 1, 0)
    console.log(startOfPeriod)
    console.log(new Date(this.customerOrdersVM[0].date_Created))
    this.filtereredCustomerOrders = this.customerOrdersVM.filter((item:any) =>new Date(item.date_Created) >= startOfPeriod && new Date(item.date_Created) <= endOfPeriod)
    this.period =  selectedPeriod.value
    console.log(this.filtereredCustomerOrders)
    console.log(this.period)
    this.GenerateDatedOrdersReport()
    }).catch(error => {
      alert(error)
    })
    //}) // comment out after....
    
  }
  ConvertDate(date:any){
    //return 
    console.log(date)
    let inDate = new Date(date)
    let datePipe = new DatePipe('en-US');
    return datePipe.transform(date, 'yyyy/MM/dd');
    //return new Date(date)
     }
  GenerateDatedOrdersReport(){
    let docDefinition = {
      content: [
        {
          text: 'Orders Report For '+this.period,
          fontSize: 16,
          alignment: 'center',
          color: '#047886'
        },
        {
          text: 'New Report',
          fontSize: 20,
          bold: true,
          alignment: 'center',
          decoration: 'underline',
          color: 'skyblue'
        },
        {
          text: 'Details',
          style: 'sectionHeader'
        },
      
        {
          text: 'Report Details',
          style: 'sectionHeader'
        },
        {
          table: {
            headerRows: 1,
            // widths: ['*', 'auto', 'auto', 'auto'],
            body: this.FormBody(this.filtereredCustomerOrders, ['customerOrder_ID','date_Created','order_Status','total',,'customer_Name'])
          }
        },
        {
          text: 'Additional Details',
          style: 'sectionHeader'
        },
        {
            text: 'this.invoice.additionalDetails',
            margin: [0, 0 ,0, 15]          
        },
      
       
        {
            ul: [
              'Order can be return in max 10 days.',
              'Warrenty of the product will be subject to the manufacturer terms and conditions.',
              'This is system generated invoice.',
            ],
        }
      ],
      styles: {
        sectionHeader: {
          bold: true,
          decoration: 'underline',
          fontSize: 14,
          margin: [0, 15,0, 15]          
        }
      }
    };

   
      pdfMake.createPdf(docDefinition).download();
      pdfMake.createPdf(docDefinition).print();      
   
      pdfMake.createPdf(docDefinition).open();
  }
  FormBody(data:CustomerOrder[], columns:any) { // https://stackoverflow.com/questions/26658535/building-table-dynamically-with-pdfmake
    var body = [];
  console.log(data)
  
  let displayedColumns = ['Order ID','Date Created','Status','Total','Customer Name']
  console.log(columns)
      body.push(displayedColumns);
      //this.reportData.map()
  console.log(data.values())
       data.forEach((row:any) => {
         let dataRow:any = [];
          
          columns.forEach( (column:any) => {
            if(column == "date_Created"){
              row[column] = this.ConvertDate(row[column])
               }
               
              dataRow.push(row[column]);
      
           })
           body.push(dataRow)
          }
         
       )
  
         
      // 
      
      console.log(body)
      console.log(body)
      return body;
  }
  generPDF() {
          
   

  }
CreateSupplierOrdersChart(){
  this.isCustomerOrder = false
  let doneOrders = this.supplierOrders.filter((item:any) => item.orderStatus_ID == 2)
 let doneOrdersLength = this.supplierOrders.filter((item:any) => item.orderStatus_ID == 2).length
 let cancelledOrders = this.supplierOrders.filter((item:any) => item.orderStatus_ID == 3)
 let cancelledOrdersLength = this.supplierOrders.filter((item:any) => item.orderStatus_ID == 3).length
 let inProgressOrders = this.supplierOrders.filter((item:any) => item.orderStatus_ID == 1)
 let inProgressOrdersLength = this.supplierOrders.filter((item:any) => item.orderStatus_ID == 1).length
// then canculate the order line...
console.log(inProgressOrders)
let doneTotal = this.CalculateSupplierOrdersTotal(doneOrders)
let cancelledTotal = this.CalculateSupplierOrdersTotal(cancelledOrders)
let inProgressTotal = this.CalculateSupplierOrdersTotal(inProgressOrders)
console.log(inProgressOrdersLength)
 console.log(doneOrders)
 let myChart = Chart.getChart("myChart")
 if(myChart){
   myChart.destroy()
 }
    this.chart = new Chart("myChart", {
      type: 'bar', //this denotes tha type of chart

      data: {// values on X-Axis
        labels: ['In Progress', 'Done','Cancelled' ], 
	       datasets: [
          {
            label: "Average cost per order (R)",
            data: [inProgressTotal/inProgressOrdersLength,doneTotal/doneOrdersLength, cancelledTotal/cancelledOrdersLength],
            backgroundColor: 'blue'
          },
          {
            label: "Total (R)",
            data: [inProgressTotal, doneTotal, cancelledTotal],
            backgroundColor: 'limegreen'
          }  
        ]
      },
      options: {
        aspectRatio:2.5,
        plugins: {
          title: {
              display: true,
              text: 'Supplier Orders Chart'
          }
      }
      }
      
    });
    console.log(this.supplierOrdersChart)
  
}
public CalculateCustomerOrderTotal(order:any){
  let orderTotal = 0
  this.customerOrderLine.forEach((item:any) => {
    if(item.order_ID == order.order_ID){
      orderTotal += item.orderTotal
    }
    
  })
  return orderTotal
}
ClearChart(){
  if(this.chart){
  this.chart.destroy()
  }
}
CreateStockTakeChart(){
  //as // put keys for graph... or...
  
  this.GetProductVM().then(response => {
    let productIndex = this.products.findIndex((item:any) => item.product_ID == this.selectedProduct)
    let product = this.products[productIndex]
    let myChart = Chart.getChart("myChart")
    if(myChart){
      myChart.destroy()
    }
 
  let colour = 'green'
  let labelString = " (Positive)"
  if(product.quantityAfterOrders < 0){
    colour = 'red'
    labelString = " (Negative)"
  }
  this.chart = new Chart("myChart", {
    type: 'bar', //this denotes tha type of chart
    // title: 'Customer Orders Chart',
    data: {// values on X-Axis
      labels: ['Stock On Hand (Positive)', 'Stock After Orders'+labelString ], 
       datasets: [
        {
          label: 'Positive',
          data: [product.quantity,Math.abs(product.quantityAfterOrders)],
          backgroundColor: ['green',colour],
          
        }
        

        // ,{
        //   label: "Stock After Orders",
        //   data: [product.quantityAfterOrders],
        //   backgroundColor: colour
        // }  
       
      ],
     
    },
    options: {
      aspectRatio:2.5,
     
      plugins: {
        title: {
            display: true,
            text: 'Product Report For '+ product.name
        },
        legend: {
          display: false
        },
        tooltip: {
          enabled: true,
          callbacks: {
            label(tooltipItem) {
              console.log(tooltipItem)
              if(tooltipItem.label.includes("Stock After Orders")){
                return + " " + product.quantityAfterOrders
              }else{
                return + " " + product.quantity
              }
             
          }
          
          
        }
    },
    
  
   
    },
 
    
  }
});
})

}
  CreateCustomerOrdersChart(){
    this.isCustomerOrder = true
 //this.supplierOrders filter the list...
 let doneOrders = this.customerOrders.filter((item:any) => item.orderStatus_ID == 2)
 let doneOrdersLength = this.customerOrders.filter((item:any) => item.orderStatus_ID == 2).length
 let cancelledOrders = this.customerOrders.filter((item:any) => item.orderStatus_ID == 3)
 let cancelledOrdersLength = this.customerOrders.filter((item:any) => item.orderStatus_ID == 3).length
 let inProgressOrders = this.customerOrders.filter((item:any) => item.orderStatus_ID == 1)
 let inProgressOrdersLength = this.customerOrders.filter((item:any) => item.orderStatus_ID == 1).length
// then canculate the order line...
console.log(inProgressOrders)
let doneTotal = this.CalculateCustomerOrdersTotal(doneOrders)
let cancelledTotal = this.CalculateCustomerOrdersTotal(cancelledOrders)
let inProgressTotal = this.CalculateCustomerOrdersTotal(inProgressOrders)
console.log(inProgressOrdersLength)
 console.log(doneOrders)
 let myChart = Chart.getChart("myChart")

 if(myChart){
   myChart.destroy()
 }
 
    this.chart = new Chart("myChart", {
      type: 'bar', //this denotes tha type of chart
      // title: 'Customer Orders Chart',
      data: {// values on X-Axis
        labels: ['In Progress', 'Done', 'Cancelled' ], 
	       datasets: [
          {
            label: "Average cost per order (R)",
            data: [inProgressTotal/inProgressOrdersLength,doneTotal/doneOrdersLength, cancelledTotal/cancelledOrdersLength],
            backgroundColor: 'blue'
          },
          {
            label: "Total (R)",
            data: [inProgressTotal, doneTotal, cancelledTotal],
            backgroundColor: 'limegreen'
          }  
        ]
      },
      options: {
        aspectRatio:2.5,
        plugins: {
          title: {
              display: true,
              text: 'Customer Orders Chart'
          }
      }
      },
   
      
    });
    console.log(this.customerOrdersChart)
  }




    invoice = new Invoice(); 
    
    CalculateCustomerOrdersTotal(orders:any){
      let total = 0
      console.log(this.customerOrderLine)
      orders.forEach((element:any) => {
        console.log(element)
        // get orderLine then 
        this.customerOrderLine.forEach((orderLine:any) => {
          console.log(orderLine)
          if(orderLine.customerOrder_ID == element.customerOrder_ID){
            total = total + (orderLine.quantity * orderLine.price)
        }
      })
      
        
      });
      return total
    }
    CalculateSupplierOrdersTotal(orders:any){
      let total = 0
      console.log(this.customerOrderLine)
      orders.forEach((element:any) => {
        console.log(element)
        // get orderLine then 
        this.supplierOrderLine.forEach((orderLine:any) => {
          console.log(orderLine)
          if(orderLine.supplierOrder_ID == element.supplierOrder_ID){
            total = total + (orderLine.quantity * orderLine.price)
        }
      })
      
        
      });
      return total
    }
    

      





      getProducts(){
        this.productService.getProductList().subscribe(response => {
          console.log(response);
          this.dataProduct = response;
        })
      }




getSuppliers(){

  this.supply.getSupplierList().subscribe(response => {
    console.log(response);
    this.dataSupplier = response;
  })

}



getOrders(){
  this.orderservice.getOrderList().subscribe(response => {
    console.log(response);
    this.dataOrder = response;
  })
  

}
async getCustomerOrdersViewModel(){
  let value = new Promise((resolve, reject) => {
    this.orderservice.getCustomerOrdersViewModel().subscribe(response => {
    console.log(response);
    resolve(response)
    this.customerOrdersVM = response;
  }),(error:any) => {
    reject(error)
  }
  
  })
  await value
  return value
  
}
}
// generateOrdersReport(){
  
//     let docDefinition = {
//       content: [
//         {
//           text: 'Report',
//           fontSize: 16,
//           alignment: 'center',
//           color: '#047886'
//         },
//         {
//           text: 'Orders report',
//           fontSize: 20,
//           bold: true,
//           alignment: 'center',
//           decoration: 'underline',
//           color: 'skyblue'
//         },
//         {
//           text: 'Details',
//           style: 'sectionHeader'
//         },
//         {
//           columns: [
//             [
//               {
//                 text: '',
//                 bold:true
//               },
//               { text: '' },
//               { text: ''},
//               { text: '' }
//             ],
//             [
//               {
//                 text: `Date: ${new Date().toLocaleString()}`,
//                 alignment: 'right'
//               },
//               { 
//                 text: `Bill No : ${((Math.random() *1000).toFixed(0))}`,
//                 alignment: 'right'
//               }
//             ]
//           ]
//         },
//         {
//           text: 'report Details',
//           style: 'sectionHeader'
//         },
//         {
//           table: {
//             headerRows: 1,
//             widths: ['*', 'auto', 'auto', 'auto'],
//             body: [
//               ['Orders ID', 'Supplier Name', 'Quantity', 'Amount'],
//               ...this.dataOrder.map((p: { order_ID: any; supplierName: any; quantity: any; }) => ([p.order_ID, p.supplierName, p.quantity, (p.quantity).toFixed(2)])),
//               [{text: 'Total Order Quantity', colSpan: 3}, {}, {}, this.dataOrder.reduce((sum: number, p: { quantity: number;  })=> sum + (p.quantity), 0).toFixed(2)]
//             ]
//           }
//         },
//         {
//           text: 'Additional Details',
//           style: 'sectionHeader'
//         },
//         {
//             text: 'this.invoice.additionalDetails',
//             margin: [0, 0 ,0, 15]          
//         },
//         {
//           columns: [
//             [{ qr: `${'this.invoice.customerName'}`, fit: '50' }],
//             [{ text: 'Signature', alignment: 'right', italics: true}],
//           ]
//         },
//         {
//           text: 'Terms and Conditions',
//           style: 'sectionHeader'
//         },
//         {
//             ul: [
//               '',
//               'Warrenty of the product will be subject to the manufacturer terms and conditions.',
//               'This is system generated invoice.',
//             ],
//         }
//       ],
//       styles: {
//         sectionHeader: {
//           bold: true,
//           decoration: 'underline',
//           fontSize: 14,
//           margin: [0, 15,0, 15]          
//         }
//       }
//     };

   
//       pdfMake.createPdf(docDefinition).download();
//       //pdfMake.createPdf(docDefinition).print();      
   
//       pdfMake.createPdf(docDefinition).open();      
   

//   }

  

//   async getwriteOffs(){
//     this.writeOffService.getWriteOffList().subscribe(response => {
//       console.log(response);
//       this.dataWriteOff = response;
//     })
    

//   }
// generateWriteOffsReport(){
//   let docDefinition = {
//     content: [
//       {
//         text: 'Reports',
//         fontSize: 16,
//         alignment: 'center',
//         color: '#047886'
//       },
//       {
//         text: 'write off report',
//         fontSize: 20,
//         bold: true,
//         alignment: 'center',
//         decoration: 'underline',
//         color: 'skyblue'
//       },
//       {
//         text: 'Details',
//         style: 'sectionHeader'
//       },
//       {
//         columns: [
//           [
//             {
//               text: '',
//               bold:true
//             },
//             { text: '' },
//             { text: ' '},
//             { text: '' }
//           ],
//           [
//             {
//               text: `Date: ${new Date().toLocaleString()}`,
//               alignment: 'right'
//             },
//             { 
//               text: `Bill No : ${((Math.random() *1000).toFixed(0))}`,
//               alignment: 'right'
//             }
//           ]
//         ]
//       },
//       {
//         text: 'report Details',
//         style: 'sectionHeader'
//       },
//       {
//         table: {
//           headerRows: 1,
//           widths: ['*', 'auto', 'auto', 'auto'],
//           body: [
//             ['write off ID', 'item Name', 'quantity', 'reason'],
//             ...this.dataWriteOff.map((p: { write_Off_Id: any; item_name: any; quantity_Written_Off: any; reason: any}) => ([p.write_Off_Id, p.item_name, p.quantity_Written_Off, p.reason])),
            
//           ]
//         }
//       },
//       {
//         text: 'Additional Details',
//         style: 'sectionHeader'
//       },
//       {
//           text: '',
//           margin: [0, 0 ,0, 15]          
//       },
//       {
//         columns: [
//           [{ qr: `${'this.invoice.customerName'}`, fit: '50' }],
//           [{ text: 'Signature', alignment: 'right', italics: true}],
//         ]
//       },
//       {
//         text: 'Terms and Conditions',
//         style: 'sectionHeader'
//       },
//       {
//           ul: [
//             '',
//             'Warrenty of the product will be subject to the manufacturer terms and conditions.',
//             'This is system generated invoice.',
//           ],
//       }
//     ],
//     styles: {
//       sectionHeader: {
//         bold: true,
//         decoration: 'underline',
//         fontSize: 14,
//         margin: [0, 15,0, 15]          
//       }
//     }
//   };

 
//     pdfMake.createPdf(docDefinition).download();
//     pdfMake.createPdf(docDefinition).print();      
 
//     pdfMake.createPdf(docDefinition).open();      
 

  
// }

// getInventory(){
//   this.inv.getInventoryList().subscribe(response => {
//     console.log(response);
//     this.dataInventory = response;
//   })
// }

// generateInventoryReport(){
//     let docDefinition = {
//       content: [
//         {
//           text: 'Reports',
//           fontSize: 16,
//           alignment: 'center',
//           color: '#047886'
//         },
//         {
//           text: 'Inventory Report',
//           fontSize: 20,
//           bold: true,
//           alignment: 'center',
//           decoration: 'underline',
//           color: 'skyblue'
//         },
//         {
//           text: 'Details',
//           style: 'sectionHeader'
//         },
//         {
//           columns: [
//             [
//               {
//                 text: '',
//                 bold:true
//               },
//               { text: '' },
//               { text: ' '},
//               { text: '' }
//             ],
//             [
//               {
//                 text: `Date: ${new Date().toLocaleString()}`,
//                 alignment: 'right'
//               },
//               { 
//                 text: `Bill No : ${((Math.random() *1000).toFixed(0))}`,
//                 alignment: 'right'
//               }
//             ]
//           ]
//         },
//         {
//           text: 'report Details',
//           style: 'sectionHeader'
//         },
//         {
//           table: {
//             headerRows: 1,
//             widths: ['*', 'auto', 'auto', 'auto'],
//             body: [
//               ['Inventory_ID', 'Inventory_Items', 'Quantity', 'Amount'],
//               ...this.dataInventory.map((p: { inventory_ID: any; inventory_Items: any; quantity: any; }) => ([p.inventory_ID, p.inventory_Items, p.quantity, (p.quantity).toFixed(2)])),
//               [{text: 'Total inventory', colSpan: 3}, {}, {}, this.dataInventory.reduce((sum: number, p: { quantity: number;  })=> sum + (p.quantity), 0).toFixed(2)]
//             ]
//           }
//         },
//         {
//           text: 'Additional Details',
//           style: 'sectionHeader'
//         },
//         {
//             text: 'information',
//             margin: [0, 0 ,0, 15]          
//         },
//         {
//           columns: [
//             [{ qr: `${'this.invoice.customerName'}`, fit: '50' }],
//             [{ text: 'Signature', alignment: 'right', italics: true}],
//           ]
//         },
//         {
//           text: 'Terms and Conditions',
//           style: 'sectionHeader'
//         },
//         {
//             ul: [
//               '',
//               'Warrenty of the product will be subject to the manufacturer terms and conditions.',
//               'This is system generated invoice.',
//             ],
//         }
//       ],
//       styles: {
//         sectionHeader: {
//           bold: true,
//           decoration: 'underline',
//           fontSize: 14,
//           margin: [0, 15,0, 15]          
//         }
//       }
//     };

   
//       pdfMake.createPdf(docDefinition).download();
//       //pdfMake.createPdf(docDefinition).print();      
   
//       pdfMake.createPdf(docDefinition).open();      
   

//   }

  
// }







































