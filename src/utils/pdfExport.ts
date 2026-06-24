import { jsPDF } from 'jspdf';
import { Post, PillarConfig, STATUS_CONFIGS } from '../types';
import { MONTH_NAMES } from '../utils';

// Helper to convert hex colors to RGB
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [100, 116, 139]; // default slate color
}

// Convert status names to brand accent colors for PDF
const STATUS_COLORS: Record<string, [number, number, number]> = {
  'Idea': [148, 163, 184],       // slate
  'Scripting': [249, 115, 22],    // orange
  'Filming': [14, 165, 233],      // sky
  'Scheduled': [59, 130, 246],    // blue
  'Posted': [16, 185, 129]        // emerald
};

export function exportPlanAsPDF(
  posts: Post[],
  pillars: PillarConfig[],
  startYear: number,
  startMonth: number, // 0-indexed
  type: 'month' | '3month'
) {
  // Initialize jsPDF (Portrait, mm, A4)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2); // 180mm

  // Determine months included in the range
  interface MonthRange {
    year: number;
    month: number;
  }
  const monthsToInclude: MonthRange[] = [];
  
  if (type === 'month') {
    monthsToInclude.push({ year: startYear, month: startMonth });
  } else {
    // 3 Months View
    for (let i = 0; i < 3; i++) {
      let targetMonth = startMonth + i;
      let targetYear = startYear;
      if (targetMonth > 11) {
        targetMonth -= 12;
        targetYear += 1;
      }
      monthsToInclude.push({ year: targetYear, month: targetMonth });
    }
  }

  // Filter posts that belong to the active months range
  const filteredPosts: Post[] = [];
  posts.forEach(post => {
    if (post.recurring === 'monthly') {
      const dayPart = post.date.split('-')[2];
      monthsToInclude.forEach(m => {
        const monthPart = String(m.month + 1).padStart(2, '0');
        const virtualDate = `${m.year}-${monthPart}-${dayPart}`;
        filteredPosts.push({
          ...post,
          date: virtualDate
        });
      });
    } else {
      const pDate = new Date(post.date + 'T00:00:00');
      const pYear = pDate.getFullYear();
      const pMonth = pDate.getMonth();
      const matchesRange = monthsToInclude.some(m => m.year === pYear && m.month === pMonth);
      if (matchesRange) {
        filteredPosts.push(post);
      }
    }
  });

  // Sort posts chronologically by date and then time
  filteredPosts.sort((a, b) => {
    const dateComp = a.date.localeCompare(b.date);
    if (dateComp !== 0) return dateComp;
    const timeA = a.time || '00:00';
    const timeB = b.time || '00:00';
    return timeA.localeCompare(timeB);
  });

  let currentY = 15;

  // Header Helper function to paint on any page if required
  const drawMainHeader = (titleText: string, subtitleText: string) => {
    // Background accent bar
    doc.setFillColor(30, 41, 59); // deep slate/dark blue
    doc.rect(margin, currentY, contentWidth, 24, 'F');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.text(titleText, margin + 5, currentY + 10);

    // Subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225);
    doc.text(subtitleText, margin + 5, currentY + 17);

    // Timestamp on right
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    const dateStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    doc.text(`Generated: ${dateStr}`, margin + contentWidth - 5, currentY + 10, { align: 'right' });

    currentY += 30;
  };

  // Construct Title
  const title = type === 'month' 
    ? `CONTENT PLAN: ${MONTH_NAMES[startMonth].toUpperCase()} ${startYear}`
    : '3-MONTH CONTENT ROADMAP';
  
  const rangeStr = type === 'month'
    ? `${MONTH_NAMES[startMonth]} ${startYear}`
    : `${MONTH_NAMES[monthsToInclude[0].month]} ${monthsToInclude[0].year} - ${MONTH_NAMES[monthsToInclude[2].month]} ${monthsToInclude[2].year}`;

  drawMainHeader(title, `Schedule overview for: ${rangeStr}`);

  // Summary Metrics Section (Three Distinct Polished Cards)
  const cardWidth = 56;
  const cardHeight = 38;
  const gap = 6;

  // Calculate statistics
  const totalPosts = filteredPosts.length;

  const statusCounts = { Idea: 0, Scripting: 0, Filming: 0, Scheduled: 0, Posted: 0 };
  filteredPosts.forEach(p => {
    if (p.status in statusCounts) {
      statusCounts[p.status as keyof typeof statusCounts]++;
    }
  });

  const platformCounts: Record<string, number> = {};
  filteredPosts.forEach(p => {
    p.platforms.forEach(plat => {
      platformCounts[plat] = (platformCounts[plat] || 0) + 1;
    });
  });
  const sortedPlatforms = Object.entries(platformCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // Card 1: Total Posts
  const card1X = margin;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(card1X, currentY, cardWidth, cardHeight, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL SCHEDULED', card1X + 5, currentY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(79, 70, 229); // Elegant indigo accent
  doc.text(`${totalPosts}`, card1X + 5, currentY + 19);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Scheduled Posts', card1X + 5, currentY + 25);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Active in current scope', card1X + 5, currentY + 30);


  // Card 2: Status Breakdown
  const card2X = margin + cardWidth + gap;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(card2X, currentY, cardWidth, cardHeight, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('STATUS BREAKDOWN', card2X + 5, currentY + 6);

  const statusesList = [
    { name: 'Idea', rgb: STATUS_COLORS.Idea || [148, 163, 184], count: statusCounts.Idea },
    { name: 'Scripting', rgb: STATUS_COLORS.Scripting || [249, 115, 22], count: statusCounts.Scripting },
    { name: 'Filming', rgb: STATUS_COLORS.Filming || [14, 165, 233], count: statusCounts.Filming },
    { name: 'Scheduled', rgb: STATUS_COLORS.Scheduled || [59, 130, 246], count: statusCounts.Scheduled },
    { name: 'Posted', rgb: STATUS_COLORS.Posted || [16, 185, 129], count: statusCounts.Posted }
  ];

  let itemY = currentY + 12;
  statusesList.forEach(st => {
    doc.setFillColor(st.rgb[0], st.rgb[1], st.rgb[2]);
    doc.circle(card2X + 6, itemY - 0.9, 0.9, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(st.name, card2X + 9, itemY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(30, 41, 59);
    doc.text(`${st.count}`, card2X + cardWidth - 6, itemY, { align: 'right' });

    itemY += 5.2;
  });


  // Card 3: Platform Split
  const card3X = margin + (cardWidth * 2) + (gap * 2);
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(card3X, currentY, cardWidth, cardHeight, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('PLATFORMS DISTRIBUTION', card3X + 5, currentY + 6);

  if (sortedPlatforms.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('No active platform posts', card3X + 5, currentY + 18);
  } else {
    let platItemY = currentY + 12;
    sortedPlatforms.forEach(([platName, count]) => {
      doc.setFillColor(148, 163, 184);
      doc.circle(card3X + 6, platItemY - 0.9, 0.8, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      const cleanPlat = platName.length > 18 ? platName.substring(0, 16) + '..' : platName;
      doc.text(cleanPlat, card3X + 9, platItemY);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(30, 41, 59);
      doc.text(`${count}`, card3X + cardWidth - 6, platItemY, { align: 'right' });

      platItemY += 5.8;
    });
  }

  currentY += cardHeight + 8;

  // Title of the table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('SCHEDULED CONTENT CHRONOLOGY', margin, currentY);
  currentY += 5;

  // Table header headers
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, currentY, contentWidth, 8, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('DATE / TIME', margin + 3, currentY + 5.5);
  doc.text('PILLAR & CONTENT TITLE', margin + 32, currentY + 5.5);
  doc.text('PLATFORMS', margin + 122, currentY + 5.5);
  doc.text('STATUS', margin + 162, currentY + 5.5);

  currentY += 8;

  // Fallback for empty
  if (filteredPosts.length === 0) {
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, currentY, margin + contentWidth, currentY);
    
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text('No content posts scheduled for this timeline scope.', margin + 3, currentY + 10);
    currentY += 15;
  } else {
    // Loop posts
    filteredPosts.forEach((post) => {
      // Handle pagination
      if (currentY > 265) {
        doc.addPage();
        currentY = 15;
        
        // Draw continuous indicator
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`${title} - Continued Plan Chronology`, margin, currentY);
        doc.line(margin, currentY + 2, margin + contentWidth, currentY + 2);
        
        currentY += 7;

        // Re-draw table header on new page
        doc.setFillColor(241, 245, 249);
        doc.rect(margin, currentY, contentWidth, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text('DATE / TIME', margin + 3, currentY + 5.5);
        doc.text('PILLAR & CONTENT TITLE', margin + 32, currentY + 5.5);
        doc.text('PLATFORMS', margin + 122, currentY + 5.5);
        doc.text('STATUS', margin + 162, currentY + 5.5);

        currentY += 8;
      }

      // Format clean Date
      const postDate = new Date(post.date + 'T00:00:00');
      const formattedDate = postDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        weekday: 'short'
      });
      const formattedTime = post.time || '12:00';

      // Find pillar config for matching color dot
      const pillarCfg = pillars.find(p => p.name === post.pillar);
      const pillarColor = pillarCfg ? pillarCfg.accentColor : '#64748b';
      const [pr, pg, pb] = hexToRgb(pillarColor);

      // We will calculate height dynamically based on title wrapping
      const titleText = post.title;
      const notesText = post.notes || '';
      
      const wrappedTitle = doc.splitTextToSize(titleText, 85); // 85mm text wrap width
      const wrappedNotes = notesText ? doc.splitTextToSize(`Notes: ${notesText}`, 85) : [];
      
      const textLinesCount = wrappedTitle.length + (wrappedNotes.length > 0 ? wrappedNotes.length + 0.5 : 0);
      const rowHeight = Math.max(14, textLinesCount * 4.2 + 4);

      // Row background zebra striping
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, currentY + rowHeight, margin + contentWidth, currentY + rowHeight);

      // 1. Column: Date / Time
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text(formattedDate, margin + 3, currentY + 5);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(formattedTime, margin + 3, currentY + 9);

      // 2. Column: Pillar dot + Title & Notes
      doc.setFillColor(pr, pg, pb);
      doc.circle(margin + 33, currentY + 4.2, 1.2, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(pr, pg, pb);
      doc.text(post.pillar.toUpperCase(), margin + 36, currentY + 5);

      // Draw Wrapped Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      
      let titleY = currentY + 9.5;
      wrappedTitle.forEach((line: string) => {
        doc.text(line, margin + 33, titleY);
        titleY += 3.8;
      });

      // Draw Wrapped Notes
      if (wrappedNotes.length > 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        titleY += 1;
        wrappedNotes.forEach((line: string) => {
          doc.text(line, margin + 33, titleY);
          titleY += 3.2;
        });
      }

      // 3. Column: Platforms
      doc.setFont('helvetica', 'semibold');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      
      let platY = currentY + 5;
      post.platforms.forEach(plat => {
        doc.text(`• ${plat}`, margin + 122, platY);
        platY += 3.5;
      });

      // 4. Column: Status Badge
      const statusRGB = STATUS_COLORS[post.status] || [100, 116, 139];
      doc.setFillColor(statusRGB[0], statusRGB[1], statusRGB[2]);
      // rounded rect block representing badge
      doc.rect(margin + 162, currentY + 3.2, 22, 4.8, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.text(post.status.toUpperCase(), margin + 173, currentY + 6.6, { align: 'center' });

      // Advance currentY
      currentY += rowHeight;
    });
  }

  // Footer on last page
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Creator Calendar Content Planner | Exported for Personal Use', margin, pageHeight - 10);
  doc.text(`Page 1 of 1`, margin + contentWidth, pageHeight - 10, { align: 'right' });

  // Save Document
  const safeFilename = `${type}_view_content_plan_${startYear}_${startMonth + 1}.pdf`.toLowerCase().replace(/\s+/g, '_');
  doc.save(safeFilename);
}
