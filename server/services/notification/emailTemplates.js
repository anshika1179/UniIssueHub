/**
 * Email Templates — server/services/notification/emailTemplates.js
 */

const sanitize = (str) => {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
};

const getBaseLayout = (content) => `
  <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F5F0DE; color: #111111;">
    <div style="background-color: #FFFFFF; padding: 30px; border-radius: 8px; border: 1px solid #C7D6AE;">
      <div style="margin-bottom: 20px; border-bottom: 2px solid #C7D6AE; padding-bottom: 10px;">
        <h2 style="color: #455835; margin: 0;">UniIssueHub</h2>
      </div>
      <div style="font-size: 16px; line-height: 1.5; color: #55584D;">
        ${content}
      </div>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E3EBD8; font-size: 12px; color: #87A574; text-align: center;">
        This is an automated message from UniIssueHub. Please do not reply to this email.
      </div>
    </div>
  </div>
`;

export const getEmailTemplate = (type, data) => {
  const { name, complaintNumber, title, status, clientUrl = process.env.CLIENT_URL || 'http://localhost:5173', id } = data;
  const link = `${clientUrl}/complaints/${id}`;
  const safeTitle = sanitize(title);
  
  let subject = '';
  let content = '';
  let text = '';

  switch (type) {
    case 'complaint_created':
      subject = `Complaint Received: ${complaintNumber}`;
      content = `
        <p>Hello ${sanitize(name)},</p>
        <p>Your complaint <strong>${complaintNumber}</strong> (${safeTitle}) has been successfully received.</p>
        <p>Current Status: <strong>${status}</strong></p>
        <p>We will review it shortly. You can track its progress using the link below:</p>
        <a href="${link}" style="display: inline-block; padding: 10px 20px; background-color: #9FB88A; color: #FFFFFF; text-decoration: none; border-radius: 4px; margin-top: 10px;">View Complaint</a>
      `;
      text = `Hello ${name},\nYour complaint ${complaintNumber} (${title}) has been received.\nTrack it here: ${link}`;
      break;

    case 'complaint_assigned':
    case 'complaint_reassigned':
      subject = `New Complaint Assigned: ${complaintNumber}`;
      content = `
        <p>Hello ${sanitize(name)},</p>
        <p>A complaint has been assigned to you.</p>
        <p>Complaint: <strong>${complaintNumber}</strong> (${safeTitle})</p>
        <p>Please review and accept the assignment in your dashboard.</p>
        <a href="${clientUrl}/assignments/my" style="display: inline-block; padding: 10px 20px; background-color: #9FB88A; color: #FFFFFF; text-decoration: none; border-radius: 4px; margin-top: 10px;">View My Queue</a>
      `;
      text = `Hello ${name},\nYou have been assigned complaint ${complaintNumber} (${title}).\nView your queue: ${clientUrl}/assignments/my`;
      break;

    case 'assignment_accepted':
      subject = `Assignment Accepted: ${complaintNumber}`;
      content = `
        <p>Hello ${sanitize(name)},</p>
        <p>Your complaint <strong>${complaintNumber}</strong> has been accepted by the assigned technician and is ready to be worked on.</p>
        <a href="${link}" style="display: inline-block; padding: 10px 20px; background-color: #9FB88A; color: #FFFFFF; text-decoration: none; border-radius: 4px; margin-top: 10px;">View Complaint</a>
      `;
      text = `Hello ${name},\nYour complaint ${complaintNumber} has been accepted by a technician.\nTrack it here: ${link}`;
      break;

    case 'work_started':
      subject = `Work Started: ${complaintNumber}`;
      content = `
        <p>Hello ${sanitize(name)},</p>
        <p>The technician has started working on your complaint <strong>${complaintNumber}</strong> (${safeTitle}).</p>
        <p>Current Status: <strong>In Progress</strong></p>
        <a href="${link}" style="display: inline-block; padding: 10px 20px; background-color: #9FB88A; color: #FFFFFF; text-decoration: none; border-radius: 4px; margin-top: 10px;">View Complaint</a>
      `;
      text = `Hello ${name},\nWork has started on your complaint ${complaintNumber} (${title}).\nTrack it here: ${link}`;
      break;

    case 'complaint_resolved':
      subject = `Complaint Resolved: ${complaintNumber}`;
      content = `
        <p>Hello ${sanitize(name)},</p>
        <p>The technician has marked your complaint <strong>${complaintNumber}</strong> (${safeTitle}) as <strong>Resolved</strong>.</p>
        <p>Please review the resolution notes in the portal.</p>
        <a href="${link}" style="display: inline-block; padding: 10px 20px; background-color: #9FB88A; color: #FFFFFF; text-decoration: none; border-radius: 4px; margin-top: 10px;">View Resolution</a>
      `;
      text = `Hello ${name},\nYour complaint ${complaintNumber} has been marked as resolved.\nView resolution: ${link}`;
      break;

    case 'complaint_closed':
      subject = `Complaint Closed: ${complaintNumber}`;
      content = `
        <p>Hello ${sanitize(name)},</p>
        <p>Your complaint <strong>${complaintNumber}</strong> (${safeTitle}) has been officially <strong>Closed</strong>.</p>
        <p>Thank you for using UniIssueHub.</p>
        <a href="${link}" style="display: inline-block; padding: 10px 20px; background-color: #9FB88A; color: #FFFFFF; text-decoration: none; border-radius: 4px; margin-top: 10px;">View Details</a>
      `;
      text = `Hello ${name},\nYour complaint ${complaintNumber} has been closed.\nView details: ${link}`;
      break;

    default:
      subject = `Notification from UniIssueHub`;
      content = `<p>You have a new notification regarding complaint ${complaintNumber}.</p>`;
      text = `You have a new notification regarding complaint ${complaintNumber}.`;
  }

  return {
    subject,
    text,
    html: getBaseLayout(content)
  };
};
