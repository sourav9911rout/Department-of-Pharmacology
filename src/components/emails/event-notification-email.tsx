
import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Link,
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
              Name of the Lecture: {topic}
            </Text>
            <Text style={detailsText}>
              Conducted by: {conductedBy}
            </Text>
            <Text style={detailsText}>
              Date and Time: {formattedDateTime}
            </Text>
            <Text style={detailsText}>
              Google Meet link: <Link href={meetLink} style={link}>{meetLink}</Link>
            </Text>
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
  padding: '10px 0',
  margin: '10px 0',
};

const detailsText = {
  fontSize: '14px',
  lineHeight: '24px',
  margin: '4px 0',
  color: '#525f7f',
};

const link = {
  color: '#4e88e8',
};

const footerText = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '22px',
  marginTop: '32px',
};
