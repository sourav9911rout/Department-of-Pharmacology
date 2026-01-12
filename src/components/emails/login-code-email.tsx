
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components';

interface LoginCodeEmailProps {
  validationCode: string;
}

export default function LoginCodeEmail({ validationCode }: LoginCodeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your Login Code</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Your Login Code</Heading>
          <Text style={paragraph}>
            Use the following code to sign in to the Department of Pharmacology portal.
          </Text>
          <Text style={codeStyle}>{validationCode}</Text>
          <Text style={paragraph}>
            This code will expire in 10 minutes. If you did not request this code, you can safely ignore this email.
          </Text>
           <Text style={footerText}>
            From
            <br />
            Department of Pharmacology
            <br />
            AIIMS-CAPFIMS
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 48px',
  marginBottom: '64px',
  border: '1px solid #f0f0f0',
  borderRadius: '4px',
};

const heading = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#484848',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#525f7f',
};

const codeStyle = {
  fontSize: '36px',
  fontWeight: 'bold' as const,
  textAlign: 'center' as const,
  letterSpacing: '10px',
  color: '#484848',
  margin: '20px 0',
  padding: '10px',
  border: '1px solid #e0e0e0',
  borderRadius: '4px',
  backgroundColor: '#f1f1f1',
};

const footerText = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '22px',
  marginTop: '32px',
};
