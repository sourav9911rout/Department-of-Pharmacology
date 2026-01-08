import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import { format, parse } from 'date-fns';

interface EventNotificationEmailProps {
  topic: string;
  date: string;
  time: string;
  conductedBy: string;
  meetLink: string;
}

export default function EventNotificationEmail({
  topic,
  date,
  time,
  conductedBy,
  meetLink,
}: EventNotificationEmailProps) {
  const eventDateTime = parse(`${date} ${time}`, 'yyyy-MM-dd HH:mm', new Date());

  return (
    <Html>
      <Head />
      <Preview>Invitation: {topic}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Event Invitation</Heading>
          <Text style={paragraph}>You have been invited to the following event:</Text>
          <Section style={detailsSection}>
            <Text style={detailsTitle}>
              <strong>Topic:</strong> {topic}
            </Text>
            <Text style={detailsText}>
              <strong>Conducted By:</strong> {conductedBy}
            </Text>
            <Text style={detailsText}>
              <strong>Date:</strong> {format(eventDateTime, 'EEEE, MMMM d, yyyy')}
            </Text>
            <Text style={detailsText}>
              <strong>Time:</strong> {format(eventDateTime, 'p')}
            </Text>
          </Section>
          <Section style={buttonContainer}>
            <Button style={button} href={meetLink}>
              Join Google Meet
            </Button>
          </Section>
          <Text style={footerText}>
            This is an automated notification from the Department of Pharmacology, AIIMS CAPFIMS.
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
  padding: '20px 0 48px',
  marginBottom: '64px',
  border: '1px solid #f0f0f0',
  borderRadius: '4px',
};

const heading = {
  fontSize: '28px',
  fontWeight: 'bold',
  marginTop: '48px',
  textAlign: 'center' as const,
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'center' as const,
  color: '#525f7f',
  padding: '0 40px',
};

const detailsSection = {
  padding: '20px 40px',
  margin: '20px 0',
  backgroundColor: '#f0f4f8',
  border: '1px solid #e3e8ee',
  borderRadius: '4px',
};

const detailsTitle = {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
}

const detailsText = {
  fontSize: '14px',
  lineHeight: '20px',
  margin: '5px 0',
};


const buttonContainer = {
  textAlign: 'center' as const,
  marginTop: '32px',
};

const button = {
  backgroundColor: '#4e88e8',
  borderRadius: '3px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 20px',
};

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
  marginTop: '32px',
};
