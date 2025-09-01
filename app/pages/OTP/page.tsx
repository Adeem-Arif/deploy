import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Section,
  Text,
  Link,
} from "@react-email/components";

interface BlogOtpEmailProps {
  validationCode?: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "";

export const BlogOtpEmail = ({ validationCode }: BlogOtpEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Container style={container}>
        <Img
          src={`${baseUrl}/static/blog-logo.png`}
          width="160"
          height="60"
          alt="My Blog"
          style={logo}
        />
        <Text style={brand}>My Blog</Text>
        <Heading style={title}>Your One-Time Password</Heading>

        <Section style={codeContainer}>
          <Text style={code}>{validationCode}</Text>
        </Section>

        <Text style={paragraph}>
          Use the above code to verify your email address and complete your
          signup on <strong>My Blog</strong>.
        </Text>

        <Text style={paragraphSmall}>
          Didn’t request this? Please ignore this message or contact us at{" "}
          <Link href="mailto:support@myblog.com" style={link}>
            support@myblog.com
          </Link>
          .
        </Text>
      </Container>

      <Text style={footer}>© {new Date().getFullYear()} My Blog · All rights reserved</Text>
    </Body>
  </Html>
);

BlogOtpEmail.PreviewProps = {
  validationCode: "827391",
} as BlogOtpEmailProps;

export default BlogOtpEmail;

/* 🎨 Styles */

const main = {
  backgroundColor: "#f9fafb",
  fontFamily: "Helvetica, Arial, sans-serif",
};

const container = {
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  marginTop: "40px",
  maxWidth: "420px",
  margin: "0 auto",
  padding: "40px 20px",
};

const logo = {
  margin: "0 auto",
  display: "block",
};

const brand = {
  textAlign: "center" as const,
  fontSize: "14px",
  color: "#6b7280",
  marginTop: "4px",
  marginBottom: "20px",
  letterSpacing: "1px",
  textTransform: "uppercase" as const,
};

const title = {
  color: "#111827",
  fontSize: "22px",
  fontWeight: 600,
  textAlign: "center" as const,
  margin: "0 0 24px 0",
};

const codeContainer = {
  background: "#f3f4f6",
  borderRadius: "6px",
  margin: "0 auto 20px",
  width: "280px",
};

const code = {
  color: "#111827",
  fontSize: "34px",
  fontWeight: 700,
  letterSpacing: "8px",
  lineHeight: "40px",
  padding: "12px 0",
  margin: "0 auto",
  textAlign: "center" as const,
};

const paragraph = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 12px",
  textAlign: "center" as const,
  padding: "0 20px",
};

const paragraphSmall = {
  color: "#6b7280",
  fontSize: "13px",
  lineHeight: "20px",
  margin: "0",
  textAlign: "center" as const,
  padding: "0 20px",
};

const link = {
  color: "#2563eb",
  textDecoration: "underline",
};

const footer = {
  color: "#9ca3af",
  fontSize: "12px",
  marginTop: "24px",
  textAlign: "center" as const,
};
