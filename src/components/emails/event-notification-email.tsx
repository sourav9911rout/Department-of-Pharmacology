
import {
  Body,
  Button,
  Container,
  Head,
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
  const formattedDateTime = format(eventDateTime, "EEEE, MMMM d, yyyy 'at' p");

  return (
    <Html>
      <Head />
      <Preview>Gentle Reminder: {topic}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={paragraph}>Respected Ma’am/Sir,</Text>
          <Text style={paragraph}>
            This is a gentle reminder for the lecture scheduled in the Department of Pharmacology, for the following:
          </Text>
          <Section style={detailsSection}>
            <Text style={detailsText}>
              <strong>Name of the Lecture:</strong> {topic}
            </Text>
            <Text style={detailsText}>
              <strong>Conducted by:</strong> {conductedBy}
            </Text>
            <Text style={detailsText}>
              <strong>Date and Time:</strong> {formattedDateTime}
            </Text>
          </Section>
           <Section style={buttonContainer}>
            <Button style={button} href={meetLink}>
              Join Google Meet
            </Button>
          </Section>
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

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#525f7f',
};

const detailsSection = {
  padding: '20px 0',
  margin: '20px 0',
};

const detailsText = {
  fontSize: '14px',
  lineHeight: '24px',
  margin: '8px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
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
  fontSize: '14px',
  lineHeight: '22px',
  marginTop: '32px',
};
