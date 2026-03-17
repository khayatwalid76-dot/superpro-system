// ============= نظام المراسلات والتعاون =============

class CommunicationAndCollaboration {
  constructor() {
    this.messages = [];
    this.conversations = [];
    this.teams = [];
    this.channels = [];
    this.announcements = [];
    this.meetings = [];
  }

  // ===== المراسلات =====
  sendMessage(senderEmail, recipientEmail, subject, body) {
    const message = {
      id: Date.now(),
      from: senderEmail,
      to: recipientEmail,
      subject: subject,
      body: body,
      timestamp: new Date().toISOString(),
      read: false,
      readAt: null,
      attachments: [],
      starred: false,
      archived: false
    };

    this.messages.push(message);
    console.log(`💬 تم إرسال الرسالة: ${subject}`);

    return message;
  }

  getInbox(userEmail) {
    return this.messages.filter(m => m.to === userEmail && !m.archived);
  }

  getSentMail(userEmail) {
    return this.messages.filter(m => m.from === userEmail);
  }

  markAsRead(messageId) {
    const message = this.messages.find(m => m.id === messageId);
    if(!message) return { error: 'الرسالة غير موجودة' };

    message.read = true;
    message.readAt = new Date().toISOString();

    return { status: 'success' };
  }

  deleteMessage(messageId) {
    const index = this.messages.findIndex(m => m.id === messageId);
    if(index === -1) return { error: 'الرسالة غير موجودة' };

    this.messages[index].archived = true;
    return { status: 'success' };
  }

  // ===== المحادثات الجماعية =====
  createConversation(conversationName, participants) {
    const conversation = {
      id: Date.now(),
      name: conversationName,
      participants: participants,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      archived: false,
      pinned: false
    };

    this.conversations.push(conversation);
    console.log(`👥 تم إنشاء محادثة: ${conversationName}`);

    return conversation;
  }

  sendMessageToConversation(conversationId, senderEmail, message) {
    const conversation = this.conversations.find(c => c.id === conversationId);
    if(!conversation) return { error: 'المحادثة غير موجودة' };

    const msg = {
      id: Date.now(),
      sender: senderEmail,
      text: message,
      timestamp: new Date().toISOString(),
      reactions: [],
      attachments: []
    };

    conversation.messages.push(msg);
    conversation.updatedAt = new Date().toISOString();

    return msg;
  }

  addReactionToMessage(conversationId, messageId, emoji) {
    const conversation = this.conversations.find(c => c.id === conversationId);
    if(!conversation) return { error: 'المحادثة غير موجودة' };

    const message = conversation.messages.find(m => m.id === messageId);
    if(!message) return { error: 'الرسالة غير موجودة' };

    message.reactions.push(emoji);
    return message;
  }

  // ===== الفريق =====
  createTeam(teamName, description, members = []) {
    const team = {
      id: Date.now(),
      name: teamName,
      description: description,
      members: members,
      owner: 'currentUser',
      channels: [],
      createdAt: new Date().toISOString()
    };

    this.teams.push(team);
    console.log(`🏢 تم إنشاء فريق: ${teamName}`);

    return team;
  }

  addMemberToTeam(teamId, memberEmail, role = 'member') {
    const team = this.teams.find(t => t.id === teamId);
    if(!team) return { error: 'الفريق غير موجود' };

    const member = {
      email: memberEmail,
      role: role, // owner, manager, member
      joinedAt: new Date().toISOString()
    };

    team.members.push(member);
    return member;
  }

  removeMemberFromTeam(teamId, memberEmail) {
    const team = this.teams.find(t => t.id === teamId);
    if(!team) return { error: 'الفريق غير موجود' };

    team.members = team.members.filter(m => m.email !== memberEmail);
    return { status: 'success' };
  }

  // ===== القنوات =====
  createChannel(teamId, channelName, description) {
    const team = this.teams.find(t => t.id === teamId);
    if(!team) return { error: 'الفريق غير موجود' };

    const channel = {
      id: Date.now(),
      name: channelName,
      description: description,
      teamId: teamId,
      messages: [],
      members: team.members,
      createdAt: new Date().toISOString(),
      pinned: false
    };

    this.channels.push(channel);
    team.channels.push(channel.id);

    console.log(`📢 تم إنشاء القناة: ${channelName}`);

    return channel;
  }

  postToChannel(channelId, senderEmail, message) {
    const channel = this.channels.find(c => c.id === channelId);
    if(!channel) return { error: 'القناة غير موجودة' };

    const msg = {
      id: Date.now(),
      sender: senderEmail,
      text: message,
      timestamp: new Date().toISOString(),
      reactions: [],
      replies: [],
      attachments: []
    };

    channel.messages.push(msg);
    return msg;
  }

  replyToMessage(channelId, messageId, senderEmail, reply) {
    const channel = this.channels.find(c => c.id === channelId);
    if(!channel) return { error: 'القناة غير موجودة' };

    const message = channel.messages.find(m => m.id === messageId);
    if(!message) return { error: 'الرسالة غير موجودة' };

    const replyMsg = {
      id: Date.now(),
      sender: senderEmail,
      text: reply,
      timestamp: new Date().toISOString()
    };

    message.replies.push(replyMsg);
    return replyMsg;
  }

  // ===== الإعلانات =====
  createAnnouncement(title, content, audience = 'all', priority = 'normal') {
    const announcement = {
      id: Date.now(),
      title: title,
      content: content,
      audience: audience, // all, team, department
      priority: priority, // low, normal, high, critical
      createdAt: new Date().toISOString(),
      createdBy: 'currentUser',
      read: false,
      expireDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 أيام
    };

    this.announcements.push(announcement);
    console.log(`📣 تم نشر إعلان: ${title}`);

    return announcement;
  }

  getActiveAnnouncements() {
    const now = new Date();
    return this.announcements.filter(a => new Date(a.expireDate) > now);
  }

  markAnnouncementAsRead(announcementId) {
    const announcement = this.announcements.find(a => a.id === announcementId);
    if(!announcement) return { error: 'الإعلان غير موجود' };

    announcement.read = true;
    return { status: 'success' };
  }

  // ===== الاجتماعات =====
  scheduleMeeting(meetingData) {
    const meeting = {
      id: Date.now(),
      title: meetingData.title,
      description: meetingData.description || '',
      organizer: meetingData.organizer || 'currentUser',
      attendees: meetingData.attendees || [],
      startTime: meetingData.startTime,
      endTime: meetingData.endTime,
      meetingLink: `https://meet.superpro.com/meeting/${Date.now()}`,
      status: 'scheduled', // scheduled, in_progress, completed, cancelled
      notes: '',
      recordings: [],
      attachments: [],
      createdAt: new Date().toISOString()
    };

    this.meetings.push(meeting);
    console.log(`📅 تم جدولة الاجتماع: ${meeting.title}`);

    return meeting;
  }

  joinMeeting(meetingId, userEmail) {
    const meeting = this.meetings.find(m => m.id === meetingId);
    if(!meeting) return { error: 'الاجتماع غير موجود' };

    if(!meeting.attendees.includes(userEmail)) {
      meeting.attendees.push(userEmail);
    }

    meeting.status = 'in_progress';

    return {
      status: 'success',
      meetingLink: meeting.meetingLink,
      meeting: meeting
    };
  }

  endMeeting(meetingId, notes = '') {
    const meeting = this.meetings.find(m => m.id === meetingId);
    if(!meeting) return { error: 'الاجتماع غير موجود' };

    meeting.status = 'completed';
    meeting.notes = notes;

    console.log(`✅ انتهى الاجتماع: ${meeting.title}`);

    return { status: 'success', meeting: meeting };
  }

  addRecordingToMeeting(meetingId, recordingData) {
    const meeting = this.meetings.find(m => m.id === meetingId);
    if(!meeting) return { error: 'الاجتماع غير موجود' };

    const recording = {
      id: Date.now(),
      name: recordingData.name,
      url: recordingData.url,
      duration: recordingData.duration,
      uploadedAt: new Date().toISOString()
    };

    meeting.recordings.push(recording);
    return recording;
  }

  // ===== إحصائيات التعاون =====
  getCollaborationStats(userId) {
    const userMessages = this.messages.filter(m => m.from === userId || m.to === userId);
    const userConversations = this.conversations.filter(c => c.participants.includes(userId));
    const userTeams = this.teams.filter(t => t.members.some(m => m.email === userId));
    const userMeetings = this.meetings.filter(m => m.attendees.includes(userId));

    return {
      totalMessages: userMessages.length,
      unreadMessages: userMessages.filter(m => !m.read).length,
      totalConversations: userConversations.length,
      totalTeams: userTeams.length,
      totalMeetings: userMeetings.length,
      completedMeetings: userMeetings.filter(m => m.status === 'completed').length,
      totalChannels: this.channels.filter(c => c.members.some(m => m.email === userId)).length
    };
  }

  // ===== الحفظ والتحميل =====
  saveCommunication() {
    localStorage.setItem('superpro_messages', JSON.stringify(this.messages));
    localStorage.setItem('superpro_conversations', JSON.stringify(this.conversations));
    localStorage.setItem('superpro_teams', JSON.stringify(this.teams));
    localStorage.setItem('superpro_channels', JSON.stringify(this.channels));
    localStorage.setItem('superpro_announcements', JSON.stringify(this.announcements));
    localStorage.setItem('superpro_meetings', JSON.stringify(this.meetings));
  }

  loadCommunication() {
    const messages = localStorage.getItem('superpro_messages');
    const conversations = localStorage.getItem('superpro_conversations');
    const teams = localStorage.getItem('superpro_teams');
    const channels = localStorage.getItem('superpro_channels');
    const announcements = localStorage.getItem('superpro_announcements');
    const meetings = localStorage.getItem('superpro_meetings');

    if(messages) this.messages = JSON.parse(messages);
    if(conversations) this.conversations = JSON.parse(conversations);
    if(teams) this.teams = JSON.parse(teams);
    if(channels) this.channels = JSON.parse(channels);
    if(announcements) this.announcements = JSON.parse(announcements);
    if(meetings) this.meetings = JSON.parse(meetings);
  }
}

// إنشاء instance عام
const communicationAndCollaboration = new CommunicationAndCollaboration();
communicationAndCollaboration.loadCommunication();
console.log('✅ تم تحميل نظام المراسلات والتعاون');
