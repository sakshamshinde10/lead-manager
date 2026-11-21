// 30 made-up leads for testing and demos. None of these people exist.
// The mix is deliberate so every screen has something to show:
//   - all four statuses and all six sources
//   - some leads without a phone number or a company
//   - created dates spread over the last 30 days (daysAgo)
//
// Columns: name, email, phone, company, source, status, daysAgo

const rows = [
  ["Aarav Mehta", "aarav.mehta@brightpath.in", "+91 98200 11001", "BrightPath Learning", "Website", "New", 0],
  ["Priya Menon", "priya.menon@menonclinics.in", "+91 98200 33445", "Menon Clinics", "Referral", "Contacted", 1],
  ["Rohan Deshpande", "rohan@deshpandebuilders.com", "+91 99876 54321", "Deshpande Builders", "LinkedIn", "Qualified", 1],
  ["Sneha Kulkarni", "sneha.k@kulkarnifoods.in", "", "Kulkarni Foods", "Event", "New", 2],
  ["Farhan Sheikh", "farhan@sheikhdesigns.com", "+91 90000 11122", "Sheikh Designs", "Cold Call", "Lost", 3],
  ["Anjali Nair", "anjali@nairlogistics.in", "+91 99887 76655", "Nair Logistics", "Event", "New", 3],
  ["Dev Patel", "dev.patel@patelandsons.in", "+91 98765 12345", "Patel & Sons", "Website", "Contacted", 4],
  ["Meera Iyer", "meera.iyer@iyerconsulting.com", "+91 98111 22334", "Iyer Consulting", "LinkedIn", "Qualified", 5],
  ["Karan Malhotra", "karan.malhotra@gmail.com", "+91 97000 44556", "", "Referral", "New", 5],
  ["Pooja Joshi", "pooja@joshiweddings.in", "+91 98333 77889", "Joshi Weddings", "Website", "Contacted", 6],
  ["Vikram Singh", "vikram.singh@singhmotors.in", "+91 99000 10203", "Singh Motors", "Cold Call", "Lost", 7],
  ["Ishita Rao", "ishita.rao@raotech.io", "+91 98450 66778", "Rao Tech", "LinkedIn", "Qualified", 8],
  ["Sunita Verma", "sunita.verma@vermatextiles.in", "", "Verma Textiles", "Other", "New", 8],
  ["Nikhil Bhatt", "nikhil@bhattstudio.com", "+91 98220 55443", "Bhatt Studio", "Website", "Contacted", 9],
  ["Tanvi Gokhale", "tanvi.gokhale@outlook.com", "+91 97300 88990", "", "Event", "New", 10],
  ["Arjun Reddy", "arjun.reddy@reddyagro.in", "+91 99490 12121", "Reddy Agro", "Referral", "Qualified", 11],
  ["Neha Chopra", "neha@chopraevents.in", "+91 98100 34343", "Chopra Events", "LinkedIn", "Contacted", 12],
  ["Siddharth Jain", "siddharth.jain@jainjewellers.com", "+91 98670 56565", "Jain Jewellers", "Cold Call", "Lost", 13],
  ["Kavya Pillai", "kavya.pillai@pillaicafe.in", "+91 94470 78787", "Pillai Cafe", "Website", "New", 14],
  ["Rahul Kapoor", "rahul.kapoor@kapoorfitness.in", "+91 98730 90909", "Kapoor Fitness", "Other", "Contacted", 15],
  ["Divya Shetty", "divya.shetty@shettyhotels.com", "+91 98450 21212", "Shetty Hotels", "Referral", "Qualified", 16],
  ["Manish Agarwal", "manish@agarwalpackaging.in", "", "Agarwal Packaging", "Cold Call", "New", 18],
  ["Riya Banerjee", "riya.banerjee@banerjeelaw.in", "+91 98300 43434", "Banerjee Law", "LinkedIn", "Contacted", 19],
  ["Yash Thakur", "yash.thakur@thakurelectricals.in", "+91 98920 65656", "Thakur Electricals", "Event", "Qualified", 20],
  ["Aditi Phadke", "aditi.phadke@phadkeacademy.in", "+91 98230 87878", "Phadke Academy", "Website", "Lost", 22],
  ["Harsh Vora", "harsh.vora@voragroup.com", "+91 98190 19191", "Vora Group", "Referral", "New", 24],
  ["Simran Kaur", "simran.kaur@kaurbakers.in", "+91 98140 31313", "Kaur Bakers", "Other", "Contacted", 25],
  ["Omkar Naik", "omkar.naik@naikmarine.in", "+91 98500 53535", "Naik Marine", "LinkedIn", "Qualified", 27],
  ["Lakshmi Krishnan", "lakshmi.k@krishnansilks.in", "+91 98840 75757", "Krishnan Silks", "Event", "Lost", 28],
  ["Zoya Qureshi", "zoya.qureshi@qureshiperfumes.com", "+91 98210 97979", "Qureshi Perfumes", "Website", "New", 29],
];

const DAY = 24 * 60 * 60 * 1000;

// Returns lead objects ready to save. `now` is a parameter so tests can use a fixed date.
function buildSampleLeads(now = Date.now()) {
  return rows.map(([name, email, phone, company, source, status, daysAgo], index) => {
    // Spread the leads through the day so "newest first" has a stable order.
    const createdAt = new Date(now - daysAgo * DAY - index * 60 * 1000);
    return { name, email, phone, company, source, status, createdAt, updatedAt: createdAt };
  });
}

module.exports = { buildSampleLeads };
