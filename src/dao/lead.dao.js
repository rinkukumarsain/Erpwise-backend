const mongoose = require('mongoose');
// const moment = require('moment');

/**
 * Options for customizing the lead retrieval.
 *
 * @typedef {object} GetAllLeadOptions
 * @property {boolean} isActive - Filter leads based on their activation status.
 * @property {number} page - The current page for pagination.
 * @property {number} perPage - The number of leads to display per page.
 * @property {string} sortBy - Field to sort by.
 * @property {string} sortOrder - Sort order.
 * @property {number} level - The level of the lead.
 */

/**
 * Generates an aggregation pipeline to retrieve a paginated and sorted list of leads.
 *
 * @param {string} orgId - The organization's unique identifier.
 * @param {GetAllLeadOptions} options - Options to customize the lead retrieval.
 * @returns {Array} - An aggregation pipeline to retrieve a paginated and sorted list of leads.
 */
exports.getAllLeadPipeline = (orgId, { isActive, page, perPage, sortBy, sortOrder, level, leadId }) => {
    let pipeline = [
        {
            $match: {
                organisationId: new mongoose.Types.ObjectId(orgId),
                level: 1,
                isDeleted: false
            }
        },
        {
            $sort: {
                // 'updatedAt': -1
            }
        },
        {
            $skip: (page - 1) * perPage
        },
        {
            $limit: perPage
        },
        {
            $lookup: {
                from: 'currencies',
                let: {
                    currencyId: '$currency'
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ['$_id', '$$currencyId']
                            }
                        }
                    },
                    {
                        $project: {
                            createdAt: 0,
                            updatedAt: 0
                        }
                    }
                ],
                as: 'result'
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'salesPerson',
                foreignField: '_id',
                as: 'userDetails'
            }
        },
        {
            $addFields: {
                result: {
                    $arrayElemAt: ['$result', 0]
                },
                userDetails: {
                    $arrayElemAt: ['$userDetails', 0]
                }
            }
        },
        {
            $addFields: {
                currencyText: {
                    $concat: [
                        '$result.currencyShortForm',
                        ' (',
                        '$result.currencySymbol',
                        ')'
                    ]
                },
                salesPersonName: {
                    $concat: [
                        '$userDetails.fname',
                        ' ',
                        '$userDetails.lname'
                    ]
                }
            }
        },
        {
            $project: {
                result: 0,
                userDetails: 0
            }
        },
        // {
        //     $lookup: {
        //         from: 'leadcontacts',
        //         localField: '_id',
        //         foreignField: 'leadId',
        //         as: 'leadContacts'
        //     }
        // },
        {
            $lookup: {
                from: 'leadcontacts',
                let: {
                    leadId: '$_id'
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$leadId', '$$leadId'] },
                                    { $eq: ['$isDeleted', false] }
                                ]
                            }
                        }
                    }
                    // {
                    //     $project: {
                    //         createdAt: 0,
                    //         updatedAt: 0
                    //     }
                    // }
                ],
                as: 'leadContacts'
            }
        },
        // {
        //     $lookup: {
        //         from: 'leadaddresses',
        //         localField: '_id',
        //         foreignField: 'leadId',
        //         as: 'leadAddresses'
        //     }
        // },
        {
            $lookup: {
                from: 'leadaddresses',
                let: {
                    leadId: '$_id'
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$leadId', '$$leadId'] },
                                    { $eq: ['$isDeleted', false] }
                                ]
                            }
                        }
                    }
                    // {
                    //     $project: {
                    //         createdAt: 0,
                    //         updatedAt: 0
                    //     }
                    // }
                ],
                as: 'leadAddresses'
            }
        }
    ];

    if (isActive) {
        pipeline[0]['$match']['isActive'] = isActive === 'true' ? true : false;
    }

    if (leadId) {
        pipeline[0]['$match']['_id'] = new mongoose.Types.ObjectId(leadId);
    }

    if (level) {
        pipeline[0]['$match']['level'] = +level;
    }

    if (sortBy && sortOrder) {
        pipeline[1]['$sort'][sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
        pipeline[1]['$sort']['updatedAt'] = -1;
    }

    return pipeline;
};

/**
 * Generate an aggregation pipeline to fetch lead dashboard count.
 *
 * @param {string} orgId - The ID of the organisation.
 * @returns {Array} - An array representing the aggregation pipeline.
 */
exports.getLeadDashBoardCount = (orgId) => [
    {
        $match: {
            organisationId: new mongoose.Types.ObjectId(orgId),
            isDeleted: false
        }
    },
    {
        $group: {
            _id: '$level',
            count: {
                $sum: 1
            }
        }
    }
];

/**
 * Generate an aggregation pipeline to fetch lead pipeline section data.
 *
 * @param {string} orgId - The ID of the organisation.
 * @returns {Array} - An array representing the aggregation pipeline.
 */
exports.getPipelineData = (orgId) => [
    {
        $match: {
            organisationId: new mongoose.Types.ObjectId(orgId),
            level: 2,
            isDeleted: false
        }
    },
    {
        $lookup: {
            from: 'currencies',
            let: {
                currencyId: '$currency'
            },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $eq: ['$_id', '$$currencyId']
                        }
                    }
                },
                {
                    $project: {
                        createdAt: 0,
                        updatedAt: 0
                    }
                }
            ],
            as: 'result'
        }
    },
    {
        $lookup: {
            from: 'users',
            localField: 'salesPerson',
            foreignField: '_id',
            as: 'userDetails'
        }
    },
    {
        $addFields: {
            result: {
                $arrayElemAt: ['$result', 0]
            },
            userDetails: {
                $arrayElemAt: ['$userDetails', 0]
            }
        }
    },
    {
        $addFields: {
            currencyText: {
                $concat: [
                    '$result.currencyShortForm',
                    ' (',
                    '$result.currencySymbol',
                    ')'
                ]
            },
            salesPersonName: {
                $concat: [
                    '$userDetails.fname',
                    ' ',
                    '$userDetails.lname'
                ]
            }
        }
    },
    {
        $project: {
            result: 0,
            userDetails: 0,
            email: 0,
            phone: 0,
            salesPerson: 0,
            address: 0,
            isQualified: 0,
            isActive: 0,
            documents: 0,
            isContactAdded: 0,
            isAddressAdded: 0,
            isFinanceAdded: 0,
            createdBy: 0
        }
    },
    // {
    //   $lookup: {
    //     from: "leadcontacts",
    //     localField: "_id",
    //     foreignField: "leadId",
    //     as: "leadContacts",
    //   },
    // }
    // {
    //   $lookup: {
    //     from: "leadaddresses",
    //     localField: "_id",
    //     foreignField: "leadId",
    //     as: "leadAddresses",
    //   },
    // }
    {
        $group: {
            _id: '$qualifymeta.pipelineName',
            data: {
                $push: '$$ROOT'
            },
            count: {
                $sum: 1
            },
            total: {
                $sum: '$qualifymeta.orderValue'
            }
        }
    }
];