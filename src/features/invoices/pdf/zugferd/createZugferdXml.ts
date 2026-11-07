import { create } from "xmlbuilder2";
import { XMLBuilder } from "xmlbuilder2/lib/interfaces";
import type { ZugferdData, Position } from "./models";

export function createZugferdXml(invoiceData: ZugferdData): string {
  const { positions, invoiceNumber, invoiceDate, seller, buyer } = invoiceData;

  const xmlDoc = create({ version: "1.0", encoding: "UTF-8" });
  // prettier-ignore
  const root= xmlDoc.ele(
    "rsm:CrossIndustryInvoice",
    {
      "xmlns:rsm": "urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100",
      "xmlns:ram": "urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100",
      "xmlns:udt": "urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100",
    }
  );

  // prettier-ignore
  root.ele("rsm:ExchangedDocumentContext")
    .ele("ram:GuidelineSpecifiedDocumentContextParameter")
      .ele("ram:ID").txt("urn:cen.eu:en16931:2017").up()
    .up()
  .up();

  // prettier-ignore
  root.ele("rsm:ExchangedDocument")
    .ele("ram:ID").txt(invoiceNumber).up()
    .ele("ram:TypeCode").txt("380").up() // 380 = Commercial invoice
    .ele("ram:IssueDateTime")
      .ele("udt:DateTimeString", { format: "102" }).txt(invoiceDate).up()
    .up()
  .up();

  const transaction = root.ele("rsm:SupplyChainTradeTransaction");

  // Add all line items first
  addPositions(transaction, positions);

  // Add ApplicableHeaderTradeAgreement with Seller and Buyer
  const agreement = transaction.ele("ram:ApplicableHeaderTradeAgreement");

  // prettier-ignore
  agreement.ele("ram:SellerTradeParty")
    .ele("ram:Name").txt(seller.name).up()
    .ele("ram:PostalTradeAddress")
      .ele("ram:PostcodeCode").txt(seller.zip).up()
      .ele("ram:LineOne").txt(seller.street).up()
      .ele("ram:CityName").txt(seller.city).up()
      .ele("ram:CountryID").txt(seller.country).up()
    .up()
    .ele("ram:SpecifiedTaxRegistration")
      .ele("ram:ID", { schemeID: "VA" }).txt(seller.vatId).up()
    .up()
  .up();

  // prettier-ignore
  agreement.ele("ram:BuyerTradeParty")
    .ele("ram:Name").txt(buyer.name).up()
    .ele("ram:PostalTradeAddress")
      .ele("ram:PostcodeCode").txt(buyer.zip).up()
      .ele("ram:LineOne").txt(buyer.street).up()
      .ele("ram:CityName").txt(buyer.city).up()
      .ele("ram:CountryID").txt(buyer.country).up()
    .up()
  .up();

  // Add empty ApplicableHeaderTradeDelivery (required by schema)
  transaction.ele("ram:ApplicableHeaderTradeDelivery");

  // Add ApplicableHeaderTradeSettlement
  addMonetarySummary(transaction, positions);

  return root.end({ prettyPrint: true });
}

function addPositions(xmlDoc: XMLBuilder, positions: Position[]): void {
  positions.forEach((position) => {
    const lineItem = xmlDoc.ele("ram:IncludedSupplyChainTradeLineItem");

    // prettier-ignore
    lineItem
      .ele("ram:AssociatedDocumentLineDocument")
        .ele("ram:LineID")
        .txt(position.id)
        .up()
      .up();

    // prettier-ignore
    lineItem
      .ele("ram:SpecifiedTradeProduct")
        .ele("ram:Name")
        .txt(position.description)
        .up()
      .up();
    // SpecifiedLineTradeAgreement: GrossPrice, NetPrice (required)
    const agreement = lineItem.ele("ram:SpecifiedLineTradeAgreement");

    // prettier-ignore
    agreement
      .ele("ram:GrossPriceProductTradePrice")
        .ele("ram:ChargeAmount")
        .txt(position.price.toFixed(2))
        .up()
      .up();

    // prettier-ignore
    agreement
      .ele("ram:NetPriceProductTradePrice")
        .ele("ram:ChargeAmount")
        .txt(position.price.toFixed(2))
        .up()
      .up();

    // prettier-ignore
    lineItem
      .ele("ram:SpecifiedLineTradeDelivery")
        .ele("ram:BilledQuantity", { unitCode: "C62" })
        .txt(position.quantity.toString())
        .up()
      .up();

    // prettier-ignore
    const settlement = lineItem.ele("ram:SpecifiedLineTradeSettlement");
    const tax = settlement.ele("ram:ApplicableTradeTax");
    tax.ele("ram:TypeCode").txt("VAT").up();
    tax.ele("ram:CategoryCode").txt("E").up();
    tax.ele("ram:RateApplicablePercent").txt(position.tax.toFixed(2)).up();
    settlement
      .ele("ram:SpecifiedTradeSettlementLineMonetarySummation")
      .ele("ram:LineTotalAmount")
      .txt((position.price * position.quantity).toFixed(2))
      .up()
      .up();
  });
}

function addMonetarySummary(xmlDoc: XMLBuilder, positions: Position[]): void {
  const totalAmount = positions.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0
  );

  const settlement = xmlDoc.ele("ram:ApplicableHeaderTradeSettlement");

  // Add required InvoiceCurrencyCode before payment means
  settlement.ele("ram:InvoiceCurrencyCode").txt("EUR").up();

  // prettier-ignore
  settlement.ele("ram:SpecifiedTradeSettlementPaymentMeans")
    .ele("ram:TypeCode").txt("42").up() // 42 = Bank transfer
    .up();

  // Header-level tax: order and content per schema
  // prettier-ignore
  const tax = settlement.ele("ram:ApplicableTradeTax");
  tax.ele("ram:CalculatedAmount").txt("0.00").up();
  tax.ele("ram:TypeCode").txt("VAT").up();
  tax.ele("ram:ExemptionReason").txt("Medical service").up();
  tax.ele("ram:BasisAmount").txt(totalAmount.toFixed(2)).up();
  tax.ele("ram:CategoryCode").txt("E").up();
  tax.ele("ram:ExemptionReasonCode").txt("VATEX-EU-132").up();
  tax.ele("ram:RateApplicablePercent").txt("0.00").up();

  // Move SpecifiedTradePaymentTerms BEFORE SpecifiedTradeSettlementHeaderMonetarySummation
  settlement
    .ele("ram:SpecifiedTradePaymentTerms")
    .ele("ram:Description")
    .txt("Due within 30 days")
    .up()
    .ele("ram:DueDateDateTime")
    .ele("udt:DateTimeString", { format: "102" })
    .txt("20231031")
    .up()
    .up()
    .up();

  // prettier-ignore
  settlement.ele("ram:SpecifiedTradeSettlementHeaderMonetarySummation")
    .ele("ram:LineTotalAmount").txt(totalAmount.toFixed(2)).up()
    .ele("ram:TaxBasisTotalAmount").txt(totalAmount.toFixed(2)).up()
    .ele("ram:TaxTotalAmount").txt("0.00").up()
    .ele("ram:GrandTotalAmount").txt(totalAmount.toFixed(2)).up()
    .ele("ram:DuePayableAmount").txt(totalAmount.toFixed(2)).up()
    .up();
}
