﻿using System.ComponentModel.DataAnnotations;

namespace IBIS_API.Models
{
    public class Customer
    {
        [Key]
        public int Customer_ID {get; set;}
        public string? Customer_First_Name { get; set; }
        public string? Customer_Surname { get; set; }
        public virtual Order? Order_ID { get; set; }
        public virtual Address? Address_ID { get; set; }
        public string? Phone_Number { get; set; }
        public string? Email { get; set; }




    }
}