

const Proposal = require('../models/Proposal');


async function createProposal(req, res) {
  try {
    const { jobId, clientId, chatId, agreedPrice, jobTitle, message, deliveryDays } = req.body;

   
    if (!jobId || !clientId || !chatId || !agreedPrice || !jobTitle) {
      return res.status(400).json({ message: 'Missing required proposal fields' });
    }

    
    const existing = await Proposal.findOne({
      jobId,
      freelancer: req.user._id,
      status: 'pending'
    });

    if (existing) {
      return res.status(400).json({ message: 'You already have a pending proposal for this job' });
    }

    
    const proposal = await Proposal.create({
      jobId,
      freelancer: req.user._id,  
      client:     clientId,      
      chatId,
      agreedPrice,
      jobTitle,
      message:      message     || '',
      deliveryDays: deliveryDays || 1,
      status: 'pending'
    });

    res.status(201).json({
      message:    'Proposal created successfully',
      proposalId: proposal._id,
      proposal
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}


async function getProposalForm(req, res) {
  try {
    const { proposalId } = req.params;

    const proposal = await Proposal.findById(proposalId)
      .populate('freelancer', 'firstname lastname')  
      .populate('client',     'firstname lastname')  
      .populate('jobId',      'title');              

    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    
    const userId = req.user._id.toString();
    if (
      proposal.client._id.toString()     !== userId &&
      proposal.freelancer._id.toString() !== userId
    ) {
      return res.status(403).json({ message: 'Not authorized to view this proposal' });
    }

    
    res.status(200).json({
      proposalId:    proposal._id,
      jobTitle:      proposal.jobTitle,
      freelancerName: proposal.freelancer.firstname + ' ' + proposal.freelancer.lastname,
      clientName:    proposal.client.firstname + ' ' + proposal.client.lastname,
      agreedPrice:   proposal.agreedPrice,
      currency:      proposal.currency,
      message:       proposal.message,
      deliveryDays:  proposal.deliveryDays,
      status:        proposal.status,
      createdAt:     proposal.createdAt
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}


async function acceptProposal(req, res) {
  try {
    const { proposalId } = req.body;

    const proposal = await Proposal.findById(proposalId);

    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    
    if (proposal.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the client can accept a proposal' });
    }

    
    if (proposal.status !== 'pending') {
      return res.status(400).json({ message: 'Proposal is no longer pending' });
    }

    
    proposal.status     = 'accepted';
    proposal.acceptedAt = new Date();
    await proposal.save();

    
    const paymentRedirectUrl = `/payment.html?proposalId=${proposal._id}&amount=${proposal.agreedPrice}&currency=${proposal.currency}&freelancerId=${proposal.freelancer}&jobTitle=${encodeURIComponent(proposal.jobTitle)}`;

    res.status(200).json({
      message:            'Proposal accepted! Redirecting to payment...',
      proposalId:         proposal._id,
      status:             'accepted',
      paymentRedirectUrl  
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}


async function rejectProposal(req, res) {
  try {
    const { proposalId } = req.body;

    const proposal = await Proposal.findById(proposalId);

    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

  
    if (proposal.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the client can reject a proposal' });
    }

    if (proposal.status !== 'pending') {
      return res.status(400).json({ message: 'Proposal is no longer pending' });
    }

   
    proposal.status     = 'rejected';
    proposal.rejectedAt = new Date();
    await proposal.save();

    res.status(200).json({
      message:    'Proposal rejected.',
      proposalId: proposal._id,
      status:     'rejected'
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}


async function cancelProposal(req, res) {
  try {
    const { proposalId } = req.body;

    const proposal = await Proposal.findById(proposalId);

    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    
    if (proposal.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the freelancer can cancel their proposal' });
    }

    if (proposal.status !== 'pending') {
      return res.status(400).json({ message: 'Can only cancel a pending proposal' });
    }

    proposal.status = 'cancelled';
    await proposal.save();

    res.status(200).json({
      message:    'Proposal cancelled.',
      proposalId: proposal._id,
      status:     'cancelled'
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}


async function getMyProposals(req, res) {
  try {
   const userId = req.user._id;

    const proposals = await Proposal.find({
      $or: [
        { freelancer: userId },
        { client:     userId }
      ]
    })
      .populate('freelancer', 'firstname lastname')
      .populate('client',     'firstname lastname')
      .sort({ createdAt: -1 }); // newest first

    res.status(200).json({ proposals });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

module.exports = {
  createProposal,
  getProposalForm,
  acceptProposal,
  rejectProposal,
  cancelProposal,
  getMyProposals
};