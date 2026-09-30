import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, maxlength: 120 },
    email: { type: String, required: true, maxlength: 200 },
    phone: { type: String, required: true, maxlength: 20 },
    company: { type: String, maxlength: 160 },
    websiteType: { type: String, required: true, maxlength: 80 },
    package: { type: String, required: true, enum: ['basic', 'full-stack', 'premium', 'not-sure'] },
    budget: { type: String, maxlength: 60 },
    description: { type: String, required: true, maxlength: 3000 },
    additional: { type: String, maxlength: 2000 },
    crmStatus: { type: String, enum: ['not-configured', 'pending', 'sent', 'failed'], default: 'pending' },
    crmLeadId: String,
    crmError: String,
    emailStatus: { type: String, enum: ['not-configured', 'pending', 'sent', 'failed'], default: 'pending' },
    emailError: String,
  },
  { timestamps: true },
);
enquirySchema.index({ createdAt: -1 });
enquirySchema.index({ crmStatus: 1 });
enquirySchema.index({ emailStatus: 1 });

const Enquiry = mongoose.models.Enquiry || mongoose.model('Enquiry', enquirySchema);
const plain = (d) => (d ? { ...d.toObject(), id: String(d._id) } : null);

export function createMongoStore() {
  return {
    async create(data) { return plain(await Enquiry.create(data)); },
    async update(id, patch) { return plain(await Enquiry.findByIdAndUpdate(id, { $set: patch }, { new: true })); },
    async unsent() { return (await Enquiry.find({ crmStatus: { $in: ['pending', 'failed'] } }).sort({ createdAt: 1 }).limit(500)).map(plain); },
    async unemailed() { return (await Enquiry.find({ emailStatus: { $in: ['pending', 'failed'] } }).sort({ createdAt: 1 }).limit(500)).map(plain); },
  };
}
