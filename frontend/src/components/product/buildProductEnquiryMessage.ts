interface EnquiryMessageParams {
  productName: string;
  price: number;
  quantity?: number;
}

export function buildProductEnquiryMessage({
  productName,
  price,
  quantity = 1,
}: EnquiryMessageParams): string {
  return `🛒 Product Enquiry

Product:
${productName}

Price:
₹${price.toLocaleString("en-IN")}

Quantity:
${quantity}

Customer Name:
_________

Delivery Address:
_________

I would like to know about:
1. Product availability
2. Payment options
3. EMI options

Please assist me.`;
}