import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import { execSync } from "child_process";
import { createZugferdXml, ZugferdData } from "./";

describe("createZugferdXml", () => {
  const invoiceData: ZugferdData = {
    invoiceNumber: "INV-12345",
    invoiceDate: "2023-10-01",
    positions: [
      {
        description: "Therapy session",
        quantity: 1,
        price: 150.0,
        tax: 0.0,
        id: "pos-1",
      },
      {
        description: "Follow-up consultation",
        quantity: 1,
        price: 100.0,
        tax: 0.0,
        id: "pos-2",
      },
    ],
    seller: {
      name: "Therapist Name",
      street: "Therapist Street 123",
      city: "Therapist City",
      zip: "12345",
      country: "DE",
      vatId: "DE123456789",
    },
    buyer: {
      name: "Patient Name",
      street: "Patient Street 456",
      city: "Patient City",
      zip: "67890",
      country: "DE",
    },
  };
  it("should create a valid Zugferd XML document", () => {
    const xml = createZugferdXml(invoiceData);

    // Validate using xmllint and the schema via stdin
    const schemaPath = path.join(
      __dirname,
      "__testdata__",
      "Factur-X_1.07.3_EN16931.xsd"
    );
    let xmllintError = null;
    try {
      execSync(
        `echo "${xml.replace(
          /"/g,
          '\\"'
        )}" | xmllint --noout --schema "${schemaPath}" -`
      );
    } catch (e: unknown) {
      xmllintError = e;
    }

    expect(xmllintError).toBeNull();  
  });

  it("should transform XML to HTML and report errors in output", () => {
    const xsltPath = path.join(
      __dirname,
      "__testdata__",
      "FACTUR-X_EN16931.xslt"
    );

    const xml = createZugferdXml(invoiceData);

    const tmpXmlPath = path.join(os.tmpdir(), `zugferd-test-${Date.now()}.xml`);
    fs.writeFileSync(tmpXmlPath, xml);

    const result = execSync(`xslt3 -xsl:${xsltPath} -s:${tmpXmlPath}`, {
      encoding: "utf8",
    });

    // Optionally clean up the temp file
    fs.unlinkSync(tmpXmlPath);

    expect(result).not.toContain("failed-assert"); // or any expected HTML marker
  });
});
