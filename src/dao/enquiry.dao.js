const mongoose = require('mongoose');
// const moment = require('moment');

/**
 * Generates an aggregation pipeline to sales dashboard count
 *
 * @param {string} orgId - The organization's unique identifier.
 * @returns {Array} - An aggregation pipeline to retrieve a paginated and sorted list of enquiry.
 */
exports.getSalesDashboardCount = (orgId) => [
    {
        $match: {
            isDeleted: false,
            organisationId: new mongoose.Types.ObjectId(orgId)

        }
    },
    {
        $group: {
            _id: '$level',
            count: {
                $sum: 1
            }
        }
    },
    {
        $sort: {
            _id: 1
        }
    }
];

/**
 * Options for customizing the lead retrieval.
 *
 * @typedef {object} GetAllLeadOptions
 * @property {boolean} isActive - Filter leads based on their activation status.
 * @property {number} page - The current page for pagination.
 * @property {number} perPage - The number of leads to display per page.
 * @property {string} sortBy - Field to sort by.
 * @property {string} sortOrder - Sort order.
 * @property {string} search - complete search on all fields.
 * @property {string} salesPerson - search on sales person.
 * @property {number} level - The level of the lead.
 */

/**
 * Generates an aggregation pipeline to retrieve a paginated and sorted list of enquiry.
 *
 * @param {string} orgId - The organization's unique identifier.
 * @param {GetAllLeadOptions} options - Options to customize the lead retrieval.
 * @returns {Array} - An aggregation pipeline to retrieve a paginated and sorted list of enquiry.
 */
exports.getAllEnquiryPipeline = (orgId, { isActive, page, perPage, sortBy, sortOrder, level, leadId, enquiryId, search, salesPerson }) => {
    let pipeline = [
        {
            $match: {
                organisationId: new mongoose.Types.ObjectId(orgId),
                isDeleted: false,
                level: 1
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
                from: 'users',
                localField: 'salesPerson',
                foreignField: '_id',
                as: 'userDetails'
            }
        },
        {
            $addFields: {
                userDetails: {
                    $arrayElemAt: ['$userDetails', 0]
                }
            }
        },
        {
            $addFields: {
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
                leadId: 0,
                leadContactId: 0,
                createdBy: 0,
                updatedBy: 0,
                createdAt: 0
                // Activity: 0

            }
        },
        {
            $lookup: {
                from: 'enquiryitems',
                let: {
                    enquiryId: '$_id'
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$enquiryId', '$$enquiryId'] },
                                    { $eq: ['$isDeleted', false] }
                                ]
                            }
                        }
                    }
                ],
                as: 'enquiryItems'
            }
        }
    ];

    if (isActive) {
        pipeline[0]['$match']['isActive'] = isActive === 'true' ? true : false;
    }

    if (enquiryId) {
        pipeline[0]['$match']['_id'] = new mongoose.Types.ObjectId(enquiryId);
    }
    if (leadId) {
        pipeline[0]['$match']['leadId'] = new mongoose.Types.ObjectId(leadId);
    }
    if (salesPerson) {
        pipeline[0]['$match']['salesPerson'] = new mongoose.Types.ObjectId(salesPerson);
    }

    if (level) {
        pipeline[0]['$match']['level'] = +level;
    }

    if (search) {
        pipeline[0]['$match']['$or'] = [
            { Id: { $regex: `${search}.*`, $options: 'i' } },
            { companyName: { $regex: `${search}.*`, $options: 'i' } },
            { salesPersonName: { $regex: `${search}.*`, $options: 'i' } },
            { contactPerson: { $regex: `${search}.*`, $options: 'i' } }
            // { contact_person: { $regex: `${search}.*`, $options: 'i' } },
            // { quoteDueDate: { $regex: `${search}.*`, $options: 'i' } },
            // { final_quote: { $regex: `${search}.*`, $options: 'i' } }
        ];
    }

    if (sortBy && sortOrder) {
        pipeline[1]['$sort'][sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
        pipeline[1]['$sort']['updatedAt'] = -1;
    }

    return pipeline;
};

/**
 * Generates an aggregation pipeline to retrieve enquiry by id.
 *
 * @param {string} orgId - The organization's unique identifier.
 * @param {string} enquiryId - The enquiry's unique identifier.
 * @returns {Array} - An aggregation pipeline to retrieve a enquiry by id.
 */
exports.getEnquiryByIdPipeline = (orgId, enquiryId) => [
    {
        $match: {
            organisationId: new mongoose.Types.ObjectId(orgId),
            _id: new mongoose.Types.ObjectId(enquiryId),
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
            Activity: 0
        }
    },
    {
        $lookup: {
            from: 'enquiryitems',
            let: {
                enquiryId: '$_id'
            },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                {
                                    $eq: [
                                        '$enquiryId',
                                        '$$enquiryId'
                                    ]
                                },
                                {
                                    $eq: ['$isDeleted', false]
                                }
                            ]
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'supplieritems',
                        let: {
                            code: '$partNumberCode'
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: [
                                            '$partNumberCode',
                                            '$$code'
                                        ]
                                    }
                                }
                            },
                            {
                                $lookup: {
                                    from: 'suppliers',
                                    let: {
                                        supplierId: '$supplierId'
                                    },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $and: [
                                                        {
                                                            $eq: ['$_id', '$$supplierId']
                                                        },
                                                        {
                                                            $eq: ['$level', 3]
                                                        },
                                                        {
                                                            $eq: ['$isActive', true]
                                                        },
                                                        {
                                                            $eq: ['$isApproved', true]
                                                        }
                                                    ]
                                                }
                                            }
                                        },
                                        {
                                            $project: {
                                                companyName: 1
                                            }
                                        }
                                    ],
                                    as: 'companyName'
                                }
                            },
                            {
                                $unwind: {
                                    path: '$companyName'
                                }
                            },
                            {
                                $addFields: {
                                    companyName: '$companyName.companyName'
                                }
                            },
                            {
                                $project: {
                                    companyName: 1,
                                    supplierId: 1,
                                    supplierItemId: '$_id',
                                    _id: 0,
                                    hscode: 1,
                                    partDesc: 1,
                                    partNumber: 1,
                                    partNumberCode: 1,
                                    delivery: 1,
                                    notes: 1,
                                    unitPrice: 1
                                }
                            }
                        ],

                        as: 'supplierItems'
                    }
                }
            ],
            as: 'enquiryItems'
        }
    }
];

/**
 * Generates an aggregation pipeline to retrieve Recommended Supplier With Items.
 *
 * @param {string} enquiryId - The enquiry's unique identifier.
 * @returns {Array} - An aggregation pipeline to retrieve a Recommended Supplier With Items.
 */
exports.getRecommendedSupplierWithItems = (enquiryId) => [
    {
        $match: {
            enquiryId: new mongoose.Types.ObjectId(enquiryId),
            isDeleted: false
        }
    },
    {
        $lookup: {
            from: 'supplieritems',
            let: {
                code: '$partNumberCode'
            },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                {
                                    $eq: [
                                        '$partNumberCode',
                                        '$$code'
                                    ]
                                },
                                {
                                    $eq: ['$isDeleted', false]
                                }
                            ]
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'suppliers',
                        let: {
                            supplierId: '$supplierId'
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {
                                                $eq: [
                                                    '$_id',
                                                    '$$supplierId'
                                                ]
                                            },
                                            {
                                                $eq: ['$level', 3]
                                            },
                                            {
                                                $eq: ['$isActive', true]
                                            },
                                            {
                                                $eq: [
                                                    '$isApproved',
                                                    true
                                                ]
                                            }
                                        ]
                                    }
                                }
                            },
                            {
                                $project: {
                                    supplierId: '$_id',
                                    companyName: 1,
                                    _id: 0,
                                    industryType: 1,
                                    currency: 1
                                }
                            }
                        ],
                        as: 'supplier'
                    }
                },
                {
                    $unwind: {
                        path: '$supplier'
                    }
                },
                {
                    $lookup: {
                        from: 'suppliercontacts',
                        let: {
                            suppierId: '$supplierId'
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {
                                                $eq: [
                                                    '$supplierId',
                                                    '$$suppierId'
                                                ]
                                            },
                                            {
                                                $eq: [
                                                    '$isDeleted',
                                                    false
                                                ]
                                            }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: 'supplierContacts'
                    }
                }
            ],
            as: 'result'
        }
    },
    {
        $unwind: {
            path: '$result'
        }
    },
    {
        $project: {
            enquiryItemId: '$_id',
            enquiryId: 1,
            quantity: 1,
            supplierItemId: '$result._id',
            supplierId: '$result.supplierId',
            sCompanyName:
                '$result.supplier.companyName',
            sIndustryType:
                '$result.supplier.industryType',
            sCurrency: '$result.supplier.currency',
            sipartNumber: '$result.partNumber',
            sipartNumberCode: '$result.partNumberCode',
            sipartDesc: '$result.partDesc',
            sidelivery: '$result.delivery',
            sinotes: '$result.notes',
            siunitPrice: '$result.unitPrice',
            supplierContacts:
                '$result.supplierContacts',
            _id: 0
        }
    },
    {
        $lookup: {
            from: 'enquirysupplierselecteditems',
            let: {
                enquiryId: '$enquiryId',
                enquiryItemId: '$enquiryItemId',
                supplierId: '$supplierId',
                supplierItemId: '$supplierItemId'
            },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                {
                                    $eq: [
                                        '$enquiryId',
                                        '$$enquiryId'
                                    ]
                                },
                                {
                                    $eq: [
                                        '$enquiryItemId',
                                        '$$enquiryItemId'
                                    ]
                                },
                                {
                                    $eq: [
                                        '$supplierId',
                                        '$$supplierId'
                                    ]
                                },
                                {
                                    $eq: [
                                        '$supplierItemId',
                                        '$$supplierItemId'
                                    ]
                                }
                            ]
                        }
                    }
                }
            ],
            as: 'enquirysupplierselecteditems'
        }
    },
    {
        $unwind: {
            path: '$enquirysupplierselecteditems',
            preserveNullAndEmptyArrays: true
        }
    },
    {
        $addFields: {
            isSelected: {
                $cond: {
                    if: {
                        $gt: [
                            {
                                $ifNull: [
                                    '$enquirysupplierselecteditems',
                                    null
                                ]
                            },
                            null
                        ]
                    },
                    then: true,
                    else: false
                }
            },
            isSkipped: {
                $cond: {
                    if: {
                        $and: [
                            {
                                $gt: [
                                    {
                                        $ifNull: [
                                            '$enquirysupplierselecteditems',
                                            null
                                        ]
                                    },
                                    null
                                ]
                            },
                            {
                                $gt: [
                                    {
                                        $ifNull: [
                                            '$enquirysupplierselecteditems.isSkipped',
                                            null
                                        ]
                                    },
                                    null
                                ]
                            }
                        ]
                    },
                    then: '$enquirysupplierselecteditems.isSkipped',
                    else: false
                }
            },
            isMailSent: {
                $cond: {
                    if: {
                        $and: [
                            {
                                $gt: [
                                    {
                                        $ifNull: [
                                            '$enquirysupplierselecteditems',
                                            null
                                        ]
                                    },
                                    null
                                ]
                            },
                            {
                                $gt: [
                                    {
                                        $ifNull: [
                                            '$enquirysupplierselecteditems.isMailSent',
                                            null
                                        ]
                                    },
                                    null
                                ]
                            }
                        ]
                    },
                    then: '$enquirysupplierselecteditems.isMailSent',
                    else: false
                }
            },
            selectedItemQuantity: {
                $cond: {
                    if: {
                        $and: [
                            {
                                $gt: [
                                    {
                                        $ifNull: [
                                            '$enquirysupplierselecteditems',
                                            null
                                        ]
                                    },
                                    null
                                ]
                            },
                            {
                                $gt: [
                                    {
                                        $ifNull: [
                                            '$enquirysupplierselecteditems.quantity',
                                            null
                                        ]
                                    },
                                    null
                                ]
                            }
                        ]
                    },
                    then: '$enquirysupplierselecteditems.quantity',
                    else: null
                }
            },
            enquirysupplierselecteditemsId: {
                $cond: {
                    if: {
                        $and: [
                            {
                                $gt: [
                                    {
                                        $ifNull: [
                                            '$enquirysupplierselecteditems',
                                            null
                                        ]
                                    },
                                    null
                                ]
                            },
                            {
                                $gt: [
                                    {
                                        $ifNull: [
                                            '$enquirysupplierselecteditems._id',
                                            null
                                        ]
                                    },
                                    null
                                ]
                            }
                        ]
                    },
                    then: '$enquirysupplierselecteditems._id',
                    else: null
                }
            },
            enquirysupplierselectedContactId: {
                $cond: {
                    if: {
                        $and: [
                            {
                                $gt: [
                                    {
                                        $ifNull: [
                                            '$enquirysupplierselecteditems',
                                            null
                                        ]
                                    },
                                    null
                                ]
                            },
                            // Check if the object field is not null
                            {
                                $gt: [
                                    {
                                        $ifNull: [
                                            '$enquirysupplierselecteditems.supplierContactId',
                                            null
                                        ]
                                    },
                                    null
                                ]
                            } // Check if the quantity key is not null
                        ]
                    },
                    then: '$enquirysupplierselecteditems.supplierContactId',
                    // If the conditions are met, use the quantity value
                    else: null // Otherwise, set the value to null
                }
            }
        }
    },
    {
        $group: {
            _id: '$supplierId',
            items: {
                $push: '$$ROOT'
            },
            currency: {
                $first: '$sCurrency'
            },
            supplierContacts: {
                $first: '$supplierContacts'
            },
            companyName: {
                $first: '$sCompanyName'
            },
            industryType: {
                $first: '$sIndustryType'
            },
            enquiryId: {
                $first: '$enquiryId'
            }
        }
    },
    {
        $project: {
            'items.supplierContacts': 0,
            'items.sCurrency': 0,
            'items.sCompanyName': 0,
            'items.sIndustryType': 0,
            'items.enquiryId': 0,
            'items.supplierId': 0,
            'items.enquirysupplierselecteditems': 0
        }
    }
    ,
    {
        $lookup: {
            from: 'currencies',
            localField: 'currency',
            foreignField: '_id',
            as: 'currencyName'
        }
    },
    {
        $unwind: {
            path: '$currencyName',
            preserveNullAndEmptyArrays: true
        }
    },
    {
        $addFields: {
            currencyName: {
                $concat: [
                    '$currencyName.currencyShortForm',
                    '(',
                    '$currencyName.currencySymbol',
                    ')'
                ]
            }
        }
    },
    {
        $sort: {
            companyName: 1
        }
    }
];

/**
 * Generates an aggregation pipeline to retrieve Recommended Supplier With Items count.
 *
 * @param {string} orgId - The organization's unique identifier.
 * @param {string} enquiryId - The enquiry's unique identifier.
 * @returns {Array} - An aggregation pipeline to retrieve a Recommended Supplier With Items.
 */
exports.getRecommendedSupplierWithItemsCount = (orgId, enquiryId) => [
    {
        $match: {
            enquiryId: new mongoose.Types.ObjectId(enquiryId)
        }
    },
    {
        $facet: {
            selectedItems: [
                {
                    $group: {
                        _id: '$enquiryItemId',
                        data: {
                            $push: '$$ROOT'
                        }
                    }
                }
            ],
            emailSendItems: [
                {
                    $match: {
                        isMailSent: true
                    }
                },
                {
                    $group: {
                        _id: '$enquiryItemId'
                    }
                }
            ],
            totalItems: [
                {
                    $project: {
                        enquiryId: 1
                    }
                }
            ]
        }
    },
    {
        $addFields: {
            enquiryId: {
                $arrayElemAt: [
                    '$totalItems.enquiryId',
                    0
                ]
            }
        }
    },
    {
        $lookup: {
            from: 'enquiryitems',
            let: {
                enquiryId: '$enquiryId'
            },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                {
                                    $eq: [
                                        '$enquiryId',
                                        '$$enquiryId'
                                    ]
                                },
                                {
                                    $eq: ['$isDeleted', false]
                                }
                            ]
                        }
                    }
                }
            ],
            as: 'totalItems'
        }
    },
    {
        $addFields: {
            selectedItems: {
                $size: '$selectedItems'
            },
            emailSendItems: {
                $size: '$emailSendItems'
            },
            totalItems: {
                $size: '$totalItems'
            }
        }
    },
    {
        $lookup: {
            from: 'enquiries',
            let: {
                enquiryId: '$enquiryId'
            },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                {
                                    $eq: ['$_id', '$$enquiryId']
                                },
                                {
                                    $eq: [
                                        '$organisationId',
                                        new mongoose.Types.ObjectId(orgId)
                                    ]
                                },
                                {
                                    $eq: ['$isDeleted', false]
                                }
                            ]
                        }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        Id: 1,
                        companyName: 1,
                        dueDate: 1,
                        isItemShortListed: 1,
                        isQuoteCreated: 1,
                        quoteId: 1,
                        stageName: 1
                    }
                }
            ],
            as: 'result'
        }
    },
    {
        $addFields: {
            Id: {
                $arrayElemAt: ['$result.Id', 0]
            },
            companyName: {
                $arrayElemAt: [
                    '$result.companyName',
                    0
                ]
            },
            dueDate: {
                $arrayElemAt: ['$result.dueDate', 0]
            },
            isItemShortListed: {
                $arrayElemAt: [
                    '$result.isItemShortListed',
                    0
                ]
            },
            stageName: {
                $arrayElemAt: [
                    '$result.stageName',
                    0
                ]
            }
        }
    },
    {
        $project: {
            result: 0
        }
    }
];

/**
 * Generates an aggregation pipeline to retrieve Recommended Supplier With Items.
 *
 * @param {string} enquiryId - The enquiry's unique identifier.
 * @param {string} isShortListed - true/false.
 * @returns {Array} - An aggregation pipeline to retrieve a Recommended Supplier With Items.
 */
exports.getIteamsSupplierResponse = (enquiryId, isShortListed) => {
    let data = [
        {
            $match: {
                enquiryId: new mongoose.Types.ObjectId(enquiryId)
            }
        },
        {
            $lookup: {
                from: 'enquiryitems',
                let: {
                    id: '$enquiryItemId'
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ['$_id', '$$id']
                                    },
                                    {
                                        $eq: ['$isDeleted', false]
                                    }
                                ]
                            }
                        }
                    }
                ],
                as: 'enquiryitemsdetail'
            }
        },
        {
            $unwind: {
                path: '$enquiryitemsdetail',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: 'supplieritems',
                let: {
                    id: '$supplierItemId'
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ['$_id', '$$id']
                                    },
                                    {
                                        $eq: ['$isDeleted', false]
                                    }
                                ]
                            }
                        }
                    }
                ],
                as: 'supplieritemsdetail'
            }
        },
        {
            $unwind: {
                path: '$supplieritemsdetail',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: 'suppliers',
                let: {
                    supplierId: '$supplierId'
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ['$_id', '$$supplierId']
                                    },
                                    {
                                        $eq: ['$level', 3]
                                    },
                                    {
                                        $eq: ['$isActive', true]
                                    },
                                    {
                                        $eq: ['$isApproved', true]
                                    }
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            supplierId: '$_id',
                            companyName: 1,
                            _id: 0,
                            industryType: 1,
                            currency: 1
                        }
                    }
                ],
                as: 'supplier'
            }
        },
        {
            $unwind: {
                path: '$supplier'
            }
        },
        {
            $addFields: {
                partNumber: {
                    $cond: {
                        if: {
                            $and: [
                                {
                                    $gt: [
                                        {
                                            $ifNull: [
                                                '$finalItemDetails',
                                                null
                                            ]
                                        },
                                        null
                                    ]
                                },
                                {
                                    $gt: [
                                        {
                                            $ifNull: [
                                                '$finalItemDetails.partNumber',
                                                null
                                            ]
                                        },
                                        null
                                    ]
                                }
                            ]
                        },
                        then: '$finalItemDetails.partNumber',
                        else: '$supplieritemsdetail.partNumber'
                    }
                },
                partNumberCode: {
                    $cond: {
                        if: {
                            $and: [
                                {
                                    $gt: [
                                        {
                                            $ifNull: [
                                                '$finalItemDetails',
                                                null
                                            ]
                                        },
                                        null
                                    ]
                                },
                                {
                                    $gt: [
                                        {
                                            $ifNull: [
                                                '$finalItemDetails.partNumberCode',
                                                null
                                            ]
                                        },
                                        null
                                    ]
                                }
                            ]
                        },
                        then: '$finalItemDetails.partNumberCode',
                        else: '$supplieritemsdetail.partNumberCode'
                    }
                },
                partDesc: {
                    $cond: {
                        if: {
                            $and: [
                                {
                                    $gt: [
                                        {
                                            $ifNull: [
                                                '$finalItemDetails',
                                                null
                                            ]
                                        },
                                        null
                                    ]
                                },
                                {
                                    $gt: [
                                        {
                                            $ifNull: [
                                                '$finalItemDetails.partDesc',
                                                null
                                            ]
                                        },
                                        null
                                    ]
                                }
                            ]
                        },
                        then: '$finalItemDetails.partDesc',
                        else: '$supplieritemsdetail.partDesc'
                    }
                },
                unitPrice: {
                    $cond: {
                        if: {
                            $and: [
                                {
                                    $gt: [
                                        {
                                            $ifNull: [
                                                '$finalItemDetails',
                                                null
                                            ]
                                        },
                                        null
                                    ]
                                },
                                {
                                    $gt: [
                                        {
                                            $ifNull: [
                                                '$finalItemDetails.unitPrice',
                                                null
                                            ]
                                        },
                                        null
                                    ]
                                }
                            ]
                        },
                        then: '$finalItemDetails.unitPrice',
                        else: '$supplieritemsdetail.unitPrice'
                    }
                },
                delivery: {
                    $cond: {
                        if: {
                            $and: [
                                {
                                    $gt: [
                                        {
                                            $ifNull: [
                                                '$finalItemDetails',
                                                null
                                            ]
                                        },
                                        null
                                    ]
                                },
                                {
                                    $gt: [
                                        {
                                            $ifNull: [
                                                '$finalItemDetails.delivery',
                                                null
                                            ]
                                        },
                                        null
                                    ]
                                }
                            ]
                        },
                        then: '$finalItemDetails.delivery',
                        else: '$supplieritemsdetail.delivery'
                    }
                },
                notes: {
                    $cond: {
                        if: {
                            $and: [
                                {
                                    $gt: [
                                        {
                                            $ifNull: [
                                                '$finalItemDetails',
                                                null
                                            ]
                                        },
                                        null
                                    ]
                                },
                                {
                                    $gt: [
                                        {
                                            $ifNull: [
                                                '$finalItemDetails.notes',
                                                null
                                            ]
                                        },
                                        null
                                    ]
                                }
                            ]
                        },
                        then: '$finalItemDetails.notes',
                        else: '$supplieritemsdetail.notes'
                    }
                },
                hscode: {
                    $cond: {
                        if: {
                            $and: [
                                {
                                    $gt: [
                                        {
                                            $ifNull: [
                                                '$finalItemDetails',
                                                null
                                            ]
                                        },
                                        null
                                    ]
                                },
                                {
                                    $gt: [
                                        {
                                            $ifNull: [
                                                '$finalItemDetails.hscode',
                                                null
                                            ]
                                        },
                                        null
                                    ]
                                }
                            ]
                        },
                        then: '$finalItemDetails.hscode',
                        else: '$supplieritemsdetail.hscode'
                    }
                }
            }
        },
        {
            $group: {
                _id: '$supplierId',
                companyName: {
                    $first: '$supplier.companyName'
                },
                industryType: {
                    $first: '$supplier.industryType'
                },
                enquiryId: {
                    $first: '$enquiryId'
                },
                itemsSheet: {
                    $first: '$itemsSheet'
                },
                paymentTermsId: {
                    $first: '$financeMeta.paymentTermsId'
                },
                supplierTotal: {
                    $first: '$financeMeta.supplierTotal'
                },
                freightCharges: {
                    $first: '$financeMeta.freightCharges'
                },
                packingCharges: {
                    $first: '$financeMeta.packingCharges'
                },
                vatGroupId: {
                    $first: '$financeMeta.vatGroupId'
                },
                paymentOption: {
                    $first: '$financeMeta.paymentOption'
                },
                delivery: {
                    $first: '$finalItemDetails.delivery'
                },
                financeMeta: {
                    $first: '$financeMeta'
                },
                items: {
                    $push: '$$ROOT'
                }
            }
        },
        {
            $project: {
                'items.enquiryId': 0,
                'items.supplierId': 0,
                'items.enquiryItemId': 0,
                'items.supplierItemId': 0,
                'items.supplier': 0
            }
        },
        {
            $addFields: {
                itemsSheet: {
                    $concat: [
                        process.env.BACKEND_URL,
                        '$itemsSheet'
                    ]
                },
                supplierTotal: {
                    $toDouble: '$supplierTotal'
                },
                freightCharges: {
                    $toDouble: '$freightCharges'
                },
                packingCharges: {
                    $toDouble: '$packingCharges'
                }
            }
        },
        {
            $lookup: {
                from: 'paymentterms',
                localField: 'paymentTermsId',
                foreignField: '_id',
                as: 'paymentterms'
            }
        },
        {
            $unwind: {
                path: '$paymentterms',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: 'vats',
                localField: 'vatGroupId',
                foreignField: '_id',
                as: 'vats'
            }
        },
        {
            $unwind: {
                path: '$vats',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $addFields: {
                paymentTermNumOfDays: {
                    $cond: {
                        if: {
                            $gt: [
                                {
                                    $ifNull: [
                                        '$paymentterms',
                                        null
                                    ]
                                },
                                null
                            ]
                        },
                        then: '$paymentterms.noOfDays',
                        else: null
                    }
                },
                vatGroup: '$vats.percentage',
                temp: {
                    $add: [
                        '$supplierTotal',
                        '$freightCharges',
                        '$packingCharges'
                    ]
                },
                dividedValue: {
                    $divide: ['$vats.percentage', 100]
                }
            }
        },
        {
            $addFields: {
                vatGroupValue: {
                    $round: [
                        {
                            $multiply: [
                                '$temp',
                                '$dividedValue'
                            ]
                        },
                        // Calculate 8% of originalValue
                        2 // Number of decimal places
                    ]
                }
            }
        },
        {
            $addFields: {
                supplierFinalTotal: {
                    $round: [
                        {
                            $sum: ['$temp', '$vatGroupValue']
                        },
                        2 // Number of decimal places
                    ]
                }
            }
        },
        {
            $project: {
                temp: 0,
                dividedValue: 0,
                vats: 0,
                paymentterms: 0
            }
        }
    ];
    if (isShortListed) {
        if (isShortListed == 'true') data[0]['$match']['isShortListed'] = true;
        else data[0]['$match']['isShortListed'] = false;
    }
    // console.log(`data[0]['$match']`, data[0]['$match']);
    return data;
};

/**
 * Generates an aggregation pipeline to retrieve Recommended Supplier With Items Calculation.
 *
 * @param {string} enquiryId - The enquiry's unique identifier.
 * @returns {Array} - An aggregation pipeline to retrieve a Recommended Supplier With Items Calculation.
 */
exports.getIteamsSupplierResponseCalculation = (enquiryId) => [
    {
        $match: {
            enquiryId: new mongoose.Types.ObjectId(enquiryId),
            isShortListed: true
        }
    },
    {
        $group: {
            _id: '$supplierId',
            // data: {
            //   $push: '$$ROOT'
            // },
            financeMeta: {
                $first: '$financeMeta'
            },
            enquiryId: {
                $first: '$enquiryId'
            }
        }
    },
    {
        $addFields: {
            supplierTotal: {
                $toDouble: '$financeMeta.supplierTotal'
            },
            freightCharges: {
                $toDouble:
                    '$financeMeta.freightCharges'
            },
            packingCharges: {
                $toDouble:
                    '$financeMeta.packingCharges'
            }
        }
    },
    // {
    //     $lookup:{
    //         from: 'paymentterms',
    //         localField: 'financeMeta.paymentTermsId',
    //         foreignField: '_id',
    //         as: 'paymentterms'
    //     }
    // },
    // {
    //     $unwind: {
    //         path: '$paymentterms',
    //         preserveNullAndEmptyArrays: true
    //     }
    // },
    {
        $lookup: {
            from: 'vats',
            localField: 'financeMeta.vatGroupId',
            foreignField: '_id',
            as: 'vats'
        }
    },
    {
        $unwind: {
            path: '$vats',
            preserveNullAndEmptyArrays: true
        }
    },
    {
        $addFields: {
            temp: {
                $add: [
                    '$supplierTotal',
                    '$freightCharges',
                    '$packingCharges'
                ]
            },
            dividedValue: {
                $divide: ['$vats.percentage', 100]
            }
        }
    },
    {
        $addFields: {
            vatGroupValue: {
                $round: [
                    {
                        $multiply: [
                            '$temp',
                            '$dividedValue'
                        ]
                    },
                    // Calculate 8% of originalValue
                    2 // Number of decimal places
                ]
            }
        }
    },
    {
        $addFields: {
            supplierFinalTotal: {
                $round: [
                    {
                        $sum: ['$temp', '$vatGroupValue']
                    },
                    2 // Number of decimal places
                ]
            }
        }
    },
    {
        $group: {
            _id: '$enquiryId',
            // data: {
            //   $push: '$data'
            // },
            addedFreightCharges: {
                $sum: '$freightCharges'
            },
            addedSupplierTotal: {
                $sum: '$supplierTotal'
            },
            addedPackingCharges: {
                $sum: '$packingCharges'
            },
            addedSupplierFinalTotal: {
                $sum: '$supplierFinalTotal'
            },
            addedVatGroupValue: {
                $sum: '$vatGroupValue'
            }
        }
    },
    {
        $addFields: {
            addedSubTotal: {
                $add: [
                    '$addedSupplierTotal',
                    '$addedFreightCharges',
                    '$addedPackingCharges'
                ]
            },
            addedVatGroupValue: {
                $round: ['$addedVatGroupValue', 2]
            }
        }
    }
];

/**
 * Generates an aggregation pipeline to retrieve Compare Suppliers and Items as per Supplier’s quotes.
 *
 * @param {string} enquiryId - The enquiry's unique identifier.
 * @param {object} query - req.query
 * @returns {Array} - An aggregation pipeline to retrieve Compare Suppliers and Items as per Supplier’s quotes.
 */
exports.CompareSuppliersAndItemsAsPerSuppliersQuotes = (enquiryId, query) => {
    const { paymentTermsId, paymentOption, deliveryTerm } = query;
    let arr = [
        {
            $match: {
                enquiryId: new mongoose.Types.ObjectId(enquiryId),
                financeMeta: { $ne: null }
            }
        },
        {
            $lookup: {
                from: 'suppliers',
                let: {
                    supplierId: '$supplierId'
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ['$_id', '$$supplierId']
                                    },
                                    {
                                        $eq: ['$level', 3]
                                    },
                                    {
                                        $eq: ['$isActive', true]
                                    },
                                    {
                                        $eq: ['$isApproved', true]
                                    }
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            supplierId: '$_id',
                            companyName: 1,
                            _id: 0,
                            industryType: 1,
                            currency: 1
                        }
                    }
                ],
                as: 'supplier'
            }
        },
        {
            $unwind: {
                path: '$supplier'
            }
        },
        {
            $addFields:
            /**
             * newField: The new field name.
             * expression: The new field expression.
             */
            {
                partNumber:
                    '$finalItemDetails.partNumber',
                partNumberCode:
                    '$finalItemDetails.partNumberCode',
                partDesc: '$finalItemDetails.partDesc',
                unitPrice: '$finalItemDetails.unitPrice',
                delivery: '$finalItemDetails.delivery',
                notes: '$finalItemDetails.notes',
                hscode: '$finalItemDetails.hscode',
                total: '$finalItemDetails.total',
                companyName: '$supplier.companyName',
                industryType: '$supplier.industryType'
            }
        },
        {
            $project:
            /**
             * specifications: The fields to
             *   include or exclude.
             */
            {
                supplier: 0,
                finalItemDetails: 0
            }
        },
        {
            $group:
            /**
             * _id: The id of the group.
             * fieldN: The first field name.
             */
            {
                _id: '$enquiryItemId',
                data: {
                    $push: '$$ROOT'
                },
                partNumber: {
                    $first: '$partNumber'
                },
                partNumberCode: {
                    $first: '$partNumberCode'
                },
                partDesc: {
                    $first: '$partDesc'
                }
            }
        },
        {
            $project:
            /**
             * specifications: The fields to
             *   include or exclude.
             */
            {
                enquiryItemId: '$_id',
                _id: 0,
                data: 1,
                partNumber: 1,
                partDesc: 1,
                partNumberCode: 1
            }
        }
    ];
    if (paymentOption && paymentOption == 'Deferred Payment' && deliveryTerm && paymentTermsId) {
        let elementTOAdd = {
            $addFields: {
                color: {
                    $cond: {
                        if: {
                            $and: [
                                { $eq: ['$financeMeta.paymentTermsId', new mongoose.Types.ObjectId(paymentTermsId)] },
                                { $eq: ['$financeMeta.paymentOption', paymentOption] },
                                { $eq: ['$financeMeta.deliveryTerm', deliveryTerm] }
                            ]
                        },
                        then: '#05ae05',
                        else: '#ff0101'
                    }
                }
            }
        };
        arr.splice(1, 0, elementTOAdd);
    } else if (paymentOption && deliveryTerm) {
        let elementTOAdd = {
            $addFields: {
                color: {
                    $cond: {
                        if: {
                            $and: [
                                { $eq: ['$financeMeta.paymentOption', paymentOption] },
                                { $eq: ['$financeMeta.deliveryTerm', deliveryTerm] }
                            ]
                        },
                        then: '#05ae05',
                        else: '#ff0101'
                    }
                }
            }
        };
        arr.splice(1, 0, elementTOAdd);
    }
    return arr;
};

/**
 * Generates an aggregation pipeline to retrieve Mail Logs
 *
 * @param {string} type - The enquiry's unique identifier.
 * @param {string} enquiryId - The enquiry's unique identifier.
 * @returns {Array} - An aggregation pipeline to retrieve Mail logs
 */
exports.getMailLogsPipeline = (type, enquiryId) => [
    {
        $match: {
            $expr: {
                $and: [
                    {
                        $eq: [
                            '$mailDetails.enquiryId',
                            enquiryId
                        ]
                    },
                    {
                        $eq: [
                            '$mailDetails.type',
                            type
                        ]
                    }
                ]
            }
        }
    },
    {
        $project: {
            nodemailerResponse: 0,
            documents: 0,
            subject: 0,
            body: 0
        }
    },
    {
        $sort: {
            createdAt: -1
        }
    }
];

/**
 * Generates an aggregation pipeline to retrieve Mail Logs of enquiry selected items (in respect of supplier)
 *
 * @param {string} enquiryId - The enquiry's unique identifier.
 * @param {string} supplierId - The supplier's unique identifier.
 * @returns {Array} - An aggregation pipeline to retrieve Mail logs
 */
exports.EnquirySupplierSelectedItemMailLogs = (enquiryId, supplierId) => [
    {
        $match: {
            $expr: {
                $and: [
                    {
                        $eq: [
                            '$mailDetails.enquiryId',
                            enquiryId
                        ]
                    },
                    {
                        $eq: [
                            '$mailDetails.supplierId',
                            supplierId
                        ]
                    },
                    {
                        $eq: [
                            '$mailDetails.type',
                            'enquirySupplierSelectedItem'
                        ]
                    }
                ]
            }
        }
    },
    {
        $project: {
            nodemailerResponse: 0,
            documents: 0,
            subject: 0,
            body: 0
        }
    },
    {
        $sort: {
            createdAt: -1
        }
    }
];

/**
 * Generates an aggregation pipeline to retrieve enquiry by id for send mail.
 *
 * @param {string} orgId - The organization's unique identifier.
 * @param {string} enquiryId - The enquiry's unique identifier.
 * @returns {Array} - An aggregation pipeline to retrieve a enquiry by id.
 */
exports.getEnquiryByIdPipelineForSendMail = (orgId, enquiryId) => [
    {
        $match: {
            organisationId: new mongoose.Types.ObjectId(orgId),
            _id: new mongoose.Types.ObjectId(enquiryId),
            isDeleted: false
        }
    },
    {
        $project: {
            _id: 1,
            Id: 1,
            companyName: 1,
            dueDate: 1,
            isItemShortListed: 1
        }
    }
];

/**
 * Generates an aggregation pipeline to retrieve total price of all enquiry item (unitprice * quantity)
 *
 * @param {string} enquiryId - The enquiry's unique identifier.
 * @returns {Array} - An aggregation pipeline to retrieve data
 */
exports.getEnquiryItemTotalForCheckToTotalOrderValue = (enquiryId) => [
    {
        $match: {
            enquiryId: new mongoose.Types.ObjectId(enquiryId),
            isDeleted: false
        }
    },
    {
        $addFields: {
            totalPrice: {
                $multiply: [
                    {
                        $toDouble: '$unitPrice'
                    },
                    {
                        $toDouble: '$quantity'
                    }
                ]
            }
        }
    },
    {
        $group: {
            _id: '$enquiryId',
            totalPrice: {
                $sum: '$totalPrice'
            }
        }
    }
];


// ========================= QUOTE ============================= //

/**
 * Generates an aggregation pipeline to retrieve enquiry quote.
 *
 * @param {string} enquiryId - The enquiry's unique identifier.
 * @param {string} id - The enquiry quote's unique identifier.
 * @returns {Array} - An aggregation pipeline
 */
exports.getQuotePipeline = (enquiryId, id) => {
    let data = [
        {
            $match: {
                enquiryId: new mongoose.Types.ObjectId(enquiryId),
                isDeleted: false
            }
        },
        {
            $lookup: {
                from: 'enquirysupplierselecteditems',
                localField: 'enquiryFinalItemId',
                foreignField: '_id',
                as: 'enquiryFinalItem'
            }
        },
        {
            $lookup: {
                from: 'leads',
                localField: 'leadId',
                foreignField: '_id',
                as: 'leadData'
            }
        },
        {
            $unwind: {
                path: '$leadData',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: 'leadaddresses',
                localField: 'leadId',
                foreignField: 'leadId',
                pipeline: [
                    {
                        $match: {
                            isActive: true,
                            isDeleted: false,
                            addresstype: 'Shipping'
                        }
                    }
                ],
                as: 'shippingAddress'
            }
        },
        {
            $lookup: {
                from: 'leadaddresses',
                localField: 'leadId',
                foreignField: 'leadId',
                pipeline: [
                    {
                        $match: {
                            isActive: true,
                            isDeleted: false,
                            addresstype: 'Billing'
                        }
                    }
                ],
                as: 'billingAddress'
            }
        },
        {
            $lookup: {
                from: 'leadcontacts',
                localField: 'leadContactId',
                foreignField: '_id',
                as: 'leadContactData'
            }
        },
        {
            $unwind: {
                path: '$leadContactData',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: 'organisations',
                localField: 'organisationId',
                foreignField: '_id',
                as: 'orgData'
            }
        },
        {
            $unwind: {
                path: '$orgData',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: 'organisationaddresses',
                let: {
                    organisationId: '$organisationId'
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: [
                                            '$organisationId',
                                            '$$organisationId'
                                        ]
                                    },
                                    {
                                        $eq: [
                                            '$addresstype',
                                            'Billing'
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                ],
                as: 'organisationAddress'
            }
        },
        {
            $unwind: {
                path: '$organisationAddress',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup:
            /**
             * from: The target collection.
             * localField: The local join field.
             * foreignField: The target join field.
             * as: The name for the results.
             * pipeline: Optional pipeline to run on the foreign collection.
             * let: Optional variables to use in the pipeline field stages.
             */
            {
                from: 'currencies',
                localField: 'currency',
                foreignField: '_id',
                as: 'currencyLogo'
            }
        },
        {
            $unwind:
            /**
             * path: Path to the array field.
             * includeArrayIndex: Optional name for index.
             * preserveNullAndEmptyArrays: Optional
             *   toggle to unwind null and empty values.
             */
            {
                path: '$currencyLogo',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $addFields:
            /**
             * newField: The new field name.
             * expression: The new field expression.
             */
            {
                currencyLogo: {
                    $concat: [
                        '$currencyLogo.currencyShortForm',
                        '(',
                        '$currencyLogo.currencySymbol',
                        ')'
                    ]
                }
            }
        },
        {
            $sort: {
                isActive: -1
            }
        }
    ];
    if (id) {
        data[0]['$match']['_id'] = new mongoose.Types.ObjectId(id);
    }
    return data;
};


/**
 * Generates an aggregation pipeline to retrieve enquiry All quote for dashboard.
 *
 * @param {string} orgId - The enquiry's unique identifier.
 * @param {GetAllLeadOptions} options - Options to customize the lead retrieval.
 * @returns {Array} - An aggregation pipeline
 */
exports.getAllQuotePipeline = (orgId, { isActive, page, perPage, sortBy, sortOrder, search }) => {
    let pipeline = [
        {
            $match: {
                level: 2,
                isQuoteCreated: true,
                isDeleted: false,
                organisationId: new mongoose.Types.ObjectId(orgId)
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
            $lookup:
            /**
             * from: The target collection.
             * localField: The local join field.
             * foreignField: The target join field.
             * as: The name for the results.
             * pipeline: Optional pipeline to run on the foreign collection.
             * let: Optional variables to use in the pipeline field stages.
             */
            {
                from: 'enquiryquotes',
                localField: 'quoteId',
                foreignField: '_id',
                as: 'quoteData'
            }
        },
        {
            $unwind:
            /**
             * path: Path to the array field.
             * includeArrayIndex: Optional name for index.
             * preserveNullAndEmptyArrays: Optional
             *   toggle to unwind null and empty values.
             */
            {
                path: '$quoteData',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup:
            {
                from: 'enquirysupplierselecteditems',
                localField: 'quoteData.enquiryFinalItemId',
                foreignField: '_id',
                pipeline: [
                    {
                        $lookup: {
                            from: 'suppliers',
                            localField:
                                'supplierId',
                            foreignField: '_id',
                            as: 'supplierData'
                        }
                    },
                    {
                        $unwind: {
                            path: '$supplierData',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $addFields: {
                            supplierCompanyName: '$supplierData.companyName'
                        }
                    },
                    {
                        $project: {
                            supplierData: 0
                        }
                    }
                ],
                as: 'enquirysupplierselecteditems'
            }
        },
        {
            $addFields:
            /**
             * newField: The new field name.
             * expression: The new field expression.
             */
            {
                totalQuote: {
                    $round: ['$quoteData.totalQuote', 2]
                },
                margin: '$quoteData.margin',
                totalItemQuantity: {
                    $reduce: {
                        input:
                            '$enquirysupplierselecteditems',
                        initialValue: 0,
                        in: {
                            $add: [
                                '$$value',
                                {
                                    $toDouble:
                                        '$$this.finalItemDetails.quantity'
                                }
                            ]
                        }
                    }
                },
                totalSuppliers: {
                    $size: {
                        $setUnion: {
                            $map: {
                                input: '$enquirysupplierselecteditems',
                                as: 'item',
                                in: '$$item.supplierId'
                            }
                        }
                    }
                },
                duedate: '$quoteData.duedate',
                agentTotalCommission:
                    '$quoteData.agentTotalCommission',
                addedSupplierFinalTotal:
                    '$quoteData.addedSupplierFinalTotal',
                quote_ID: '$quoteData.Id'
            }
        },
        {
            $project:
            /**
             * specifications: The fields to
             *   include or exclude.
             */
            {
                _id: 1,
                Id: 1,
                quoteId: 1,
                quote_ID: 1,
                addedSupplierFinalTotal: 1,
                agentTotalCommission: 1,
                duedate: 1,
                totalItemQuantity: 1,
                margin: 1,
                totalQuote: 1,
                enquirysupplierselecteditems: 1,
                companyName: 1,
                contactPerson: 1,
                stageName: 1,
                isQuoteCreated: 1,
                Activity: 1,
                totalSuppliers: 1

            }
        }
    ];
    if (isActive) {
        pipeline[0]['$match']['isActive'] = isActive === 'true' ? true : false;
    }

    if (search) {
        pipeline[0]['$match']['$or'] = [
            // { Id: { $regex: `${search}.*`, $options: 'i' } },
            { companyName: { $regex: `${search}.*`, $options: 'i' } },
            { contactPerson: { $regex: `${search}.*`, $options: 'i' } }
            // { contact_person: { $regex: `${search}.*`, $options: 'i' } },
            // { quoteDueDate: { $regex: `${search}.*`, $options: 'i' } },
            // { final_quote: { $regex: `${search}.*`, $options: 'i' } }
        ];
    }

    if (sortBy && sortOrder) {
        pipeline[1]['$sort'][sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
        pipeline[1]['$sort']['updatedAt'] = -1;
    }
    return pipeline;
};

// ========================= PI ============================= //

/**
 * Generates an aggregation pipeline to retrieve enquiry ppi by id.
 *
 * @param {string} enquiryId - The enquiry's unique identifier.
 * @returns {Array} - An aggregation pipeline
 */
exports.getPiByIdPipeline = (enquiryId) => [
    {
        $match: {
            _id: new mongoose.Types.ObjectId(enquiryId),
            // level: 3,
            isPiCreated: true,
            isDeleted: false
        }
    },
    {
        $lookup: {
            from: 'leads',
            localField: 'leadId',
            foreignField: '_id',
            as: 'leadData'
        }
    },
    {
        $unwind: {
            path: '$leadData',
            preserveNullAndEmptyArrays: true
        }
    },
    {
        $lookup: {
            from: 'leadcontacts',
            localField: 'leadContactId',
            foreignField: '_id',
            as: 'leadContactData'
        }
    },
    {
        $unwind: {
            path: '$leadContactData',
            preserveNullAndEmptyArrays: true
        }
    },
    {
        $lookup: {
            from: 'enquiryquotes',
            localField: 'quoteId',
            foreignField: '_id',
            as: 'quoteData'
        }
    },
    {
        $unwind: {
            path: '$quoteData',
            preserveNullAndEmptyArrays: true
        }
    },
    {
        $lookup: {
            from: 'enquirysupplierselecteditems',
            localField: 'quoteData.enquiryFinalItemId',
            foreignField: '_id',
            as: 'quoteData.enquiryFinalItem'
        }
    },
    {
        $addFields: {
            totalSuppliers: {
                $size: {
                    $setUnion: {
                        $map: {
                            input:
                                '$quoteData.enquiryFinalItem',
                            as: 'item',
                            in: '$$item.supplierId'
                        }
                    }
                }
            }
        }
    },
    {
        $lookup: {
            from: 'organisations',
            localField: 'organisationId',
            foreignField: '_id',
            as: 'quoteData.orgData'
        }
    },
    {
        $unwind: {
            path: '$quoteData.orgData',
            preserveNullAndEmptyArrays: true
        }
    },
    {
        $lookup: {
            from: 'organisationaddresses',
            let: {
                organisationId: '$organisationId'
            },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                {
                                    $eq: [
                                        '$organisationId',
                                        '$$organisationId'
                                    ]
                                },
                                {
                                    $eq: [
                                        '$addresstype',
                                        'Billing'
                                    ]
                                }
                            ]
                        }
                    }
                }
            ],
            as: 'quoteData.organisationAddress'
        }
    },
    {
        $unwind: {
            path: '$quoteData.organisationAddress',
            preserveNullAndEmptyArrays: true
        }
    },
    {
        $lookup:
        /**
         * from: The target collection.
         * localField: The local join field.
         * foreignField: The target join field.
         * as: The name for the results.
         * pipeline: Optional pipeline to run on the foreign collection.
         * let: Optional variables to use in the pipeline field stages.
         */
        {
            from: 'currencies',
            localField: 'quoteData.currency',
            foreignField: '_id',
            as: 'quoteData.currencyLogo'
        }
    },
    {
        $unwind:
        /**
         * path: Path to the array field.
         * includeArrayIndex: Optional name for index.
         * preserveNullAndEmptyArrays: Optional
         *   toggle to unwind null and empty values.
         */
        {
            path: '$quoteData.currencyLogo',
            preserveNullAndEmptyArrays: true
        }
    },
    {
        $addFields:
        /**
         * newField: The new field name.
         * expression: The new field expression.
         */
        {
            'quoteData.currencyLogo': {
                $concat: [
                    '$quoteData.currencyLogo.currencyShortForm',
                    '(',
                    '$quoteData.currencyLogo.currencySymbol',
                    ')'
                ]
            }
        }
    }
];

/**
 * Generates an aggregation pipeline to retrieve enquiry All porforma invoice for dashboard.
 *
 * @param {string} orgId - The enquiry's unique identifier.
 * @param {GetAllLeadOptions} options - Options to customize the lead retrieval.
 * @returns {Array} - An aggregation pipeline
 */
exports.getAllPorformaInvoicePipeline = (orgId, { isActive, page, perPage, sortBy, sortOrder, search }) => {
    let pipeline = [
        {
            $match: {
                organisationId: new mongoose.Types.ObjectId(orgId),
                level: 3,
                isPiCreated: true,
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
                from: 'enquiryquotes',
                localField: 'quoteId',
                foreignField: '_id',
                as: 'quoteData'
            }
        },
        {
            $unwind: {
                path: '$quoteData',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: 'enquirysupplierselecteditems',
                localField: 'quoteData.enquiryFinalItemId',
                foreignField: '_id',
                as: 'enquirysupplierselecteditems'
            }
        },
        {
            $project: {
                _id: 1,
                Id: 1,
                quote_Id: '$quoteId',
                quoteId: '$quoteData.Id',
                pi_Id: '$proformaInvoice._id',
                piId: '$proformaInvoice.Id',
                companyName: 1,
                contactPerson: 1,
                invoiceDate: '$proformaInvoice.invoiceDate',
                invoiceDueDate: '$proformaInvoice.invoiceDueDate',
                enquirysupplierselecteditems: 1,
                totalItemQuantity: {
                    $reduce: {
                        input: '$enquirysupplierselecteditems',
                        initialValue: 0,
                        in: {
                            $add: [
                                '$$value',
                                { $toDouble: '$$this.finalItemDetails.quantity' }
                            ]
                        }
                    }
                },
                addedSupplierFinalTotal: '$proformaInvoice.addedSupplierFinalTotal',
                vatGroupValue: '$proformaInvoice.vatGroupValue',
                vatGroup: '$proformaInvoice.vatGroup',
                createXero: '$proformaInvoice.createXero',
                paymentStatus: '$proformaInvoice.paymentStatus',
                stageName: 1,
                Activity: 1
            }
        }
    ];
    if (isActive) {
        pipeline[0]['$match']['isActive'] = isActive === 'true' ? true : false;
    }

    if (search) {
        pipeline[0]['$match']['$or'] = [
            { 'proformaInvoice.Id': { $regex: `${search}.*`, $options: 'i' } },
            { companyName: { $regex: `${search}.*`, $options: 'i' } },
            { contactPerson: { $regex: `${search}.*`, $options: 'i' } }
        ];
    }

    if (sortBy && sortOrder) {
        pipeline[1]['$sort'][sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
        pipeline[1]['$sort']['updatedAt'] = -1;
    }
    return pipeline;
};

// ========================= SO ============================= //

/**
 * Generates an aggregation pipeline to retrieve enquiry SO by id.
 *
 * @param {string} enquiryId - The enquiry's unique identifier.
 * @param {string} po - To fetch po related details.
 * @returns {Array} - An aggregation pipeline
 */
exports.getSOByIdPipeline = (enquiryId, po) => {
    let pipeline = [
        {
            $match: {
                _id: new mongoose.Types.ObjectId(enquiryId),
                // level: 4,
                isSalesOrderCreated: true,
                isDeleted: false
            }
        },
        {
            $project: {
                proformaInvoice: 1,
                organisationId: 1,
                leadContactId: 1,
                leadId: 1,
                Id: 1,
                level: 1,
                isItemAdded: 1,
                isItemShortListed: 1,
                isQuoteCreated: 1,
                isPiCreated: 1,
                isSalesOrderCreated: 1,
                quoteId: 1,
                stageName: 1,
                companyName: 1,
                contactPerson: 1,
                salesOrderId: '$salesOrder.Id',
                salesOrder: 1
            }
        },
        {
            $lookup: {
                from: 'enquiryquotes',
                localField: 'quoteId',
                foreignField: '_id',
                as: 'quoteData'
            }
        },
        {
            $unwind: {
                path: '$quoteData',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: 'enquirysupplierselecteditems',
                localField: 'quoteData.enquiryFinalItemId',
                foreignField: '_id',
                as: 'quoteData.enquiryFinalItem'
            }
        },
        {
            $lookup: {
                from: 'organisations',
                localField: 'organisationId',
                foreignField: '_id',
                as: 'quoteData.orgData'
            }
        },
        {
            $unwind: {
                path: '$quoteData.orgData',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: 'organisationaddresses',
                let: {
                    organisationId: '$organisationId'
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: [
                                            '$organisationId',
                                            '$$organisationId'
                                        ]
                                    },
                                    {
                                        $eq: [
                                            '$addresstype',
                                            'Billing'
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                ],
                as: 'quoteData.organisationAddress'
            }
        },
        {
            $unwind: {
                path: '$quoteData.organisationAddress',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: 'leads',
                localField: 'leadId',
                foreignField: '_id',
                as: 'leadData'
            }
        },
        {
            $unwind: {
                path: '$leadData',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: 'leadcontacts',
                localField: 'leadContactId',
                foreignField: '_id',
                as: 'leadContactData'
            }
        },
        {
            $unwind: {
                path: '$leadContactData',
                preserveNullAndEmptyArrays: true
            }
        }
    ];

    if (po == 'yes') {
        // addfield for totalSuppliers
        pipeline.push({
            $addFields: {
                totalSuppliers: {
                    $setUnion: {
                        $map: {
                            input: '$quoteData.enquiryFinalItem',
                            as: 'item',
                            in: '$$item.supplierId'
                        }
                    }
                }
            }
        });
        // removiing enquiryFinalItem from quoteData
        pipeline.push({
            $project: {
                'quoteData.enquiryFinalItem': 0
            }
        });
        // lookup from supplier on totalSuppliers to fetch suppliers with their billing address
        pipeline.push({
            $lookup: {
                from: 'suppliers',
                localField: 'totalSuppliers',
                foreignField: '_id',
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            companyName: 1,
                            Id: 1,
                            email: 1,
                            phone: 1
                        }
                    },
                    {
                        $lookup: {
                            from: 'supplieraddresses',
                            let: {
                                id: '$_id'
                            },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                {
                                                    $eq: [
                                                        '$supplierId',
                                                        '$$id'
                                                    ]
                                                },
                                                {
                                                    $eq: [
                                                        '$isDeleted',
                                                        false
                                                    ]
                                                },
                                                {
                                                    $eq: [
                                                        '$addresstype',
                                                        'Billing'
                                                    ]
                                                }
                                            ]
                                        }
                                    }
                                }
                            ],
                            as: 'billingAddress'
                        }
                    },
                    {
                        $lookup: {
                            from: 'enquirysupplierselecteditems',
                            let: {
                                id: '$_id',
                                enquiryId: new mongoose.Types.ObjectId(enquiryId)
                            },
                            pipeline: [
                                // Add your stages here based on the requirements
                                {
                                    $match: {
                                        $expr: {
                                            // Your match conditions here
                                            $and: [
                                                {
                                                    $eq: [
                                                        '$supplierId',
                                                        '$$id'
                                                    ]
                                                },
                                                {
                                                    $eq: [
                                                        '$enquiryId',
                                                        '$$enquiryId'
                                                    ]
                                                },
                                                {
                                                    $eq: [
                                                        '$isShortListed',
                                                        true
                                                    ]
                                                }
                                            ]
                                        }
                                    }
                                },
                                {
                                    $lookup: {
                                        from: 'supplieritems',
                                        localField: 'supplierItemId',
                                        foreignField: '_id',
                                        as: 'supplieritems'
                                    }
                                },
                                {
                                    $unwind: {
                                        path: '$supplieritems',
                                        preserveNullAndEmptyArrays: true
                                    }
                                }
                            ],
                            as: 'enquiryFinalItem'
                        }
                    },
                    {
                        $addFields: {
                            financeMeta: {
                                $arrayElemAt: [
                                    '$enquiryFinalItem.financeMeta',
                                    0
                                ]
                            }
                        }
                    }
                ],
                as: 'totalSuppliers'
            }
        });
        //  lookup from lead address to fetch the shipping address
        pipeline.push({
            $lookup: {
                from: 'leadaddresses',
                localField: 'leadId',
                foreignField: 'leadId',
                pipeline: [
                    {
                        $match: {
                            isActive: true,
                            isDeleted: false,
                            addresstype: 'Shipping'
                        }
                    }
                ],
                as: 'shippingAddress'
            }
        });
        //  lookup from warehouses to fetch the abailabe warehouses
        pipeline.push({
            $lookup: {
                from: 'warehouses',
                localField: 'organisationId',
                foreignField: 'organisationId',
                pipeline: [
                    {
                        $match: {
                            isActive: true,
                            isDeleted: false
                        }
                    }
                ],
                as: 'warehouses'
            }
        });
    }
    return pipeline;
};

/**
 * Generates an aggregation pipeline to retrieve enquiry All sales order for dashboard.
 *
 * @param {string} orgId - The enquiry's unique identifier.
 * @param {GetAllLeadOptions} options - Options to customize the lead retrieval.
 * @returns {Array} - An aggregation pipeline
 */
exports.getAllSalesOrderPipeline = (orgId, { isActive, page, perPage, sortBy, sortOrder, search }) => {
    let pipeline = [
        {
            $match: {
                organisationId: new mongoose.Types.ObjectId(orgId),
                level: 4,
                isQuoteCreated: true,
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
                from: 'enquiryquotes',
                localField: 'quoteId',
                foreignField: '_id',
                as: 'quoteData'
            }
        },
        {
            $unwind: {
                path: '$quoteData',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: 'enquirysupplierselecteditems',
                localField: 'quoteData.enquiryFinalItemId',
                foreignField: '_id',
                as: 'enquirysupplierselecteditems'
            }
        },
        {
            $project: {
                _id: 1,
                Id: 1,
                quote_Id: '$quoteId',
                quoteId: '$quoteData.Id',
                pi_Id: '$proformaInvoice._id',
                piId: '$proformaInvoice.Id',
                so_Id: '$salesOrder._id',
                soId: '$salesOrder.Id',
                customerPORefNo:
                    '$salesOrder.customerPORefNo',
                margin: '$quoteData.margin',
                companyName: 1,
                contactPerson: 1,
                invoiceDueDate:
                    '$proformaInvoice.invoiceDueDate',
                enquirysupplierselecteditems: 1,
                totalItemQuantity: {
                    $reduce: {
                        input: '$enquirysupplierselecteditems',
                        initialValue: 0,
                        in: {
                            $add: [
                                '$$value',
                                {
                                    $toDouble:
                                        '$$this.finalItemDetails.quantity'
                                }
                            ]
                        }
                    }
                },
                addedSupplierFinalTotal:
                    '$proformaInvoice.addedSupplierFinalTotal',
                createXero: '$proformaInvoice.createXero',
                paymentStatus:
                    '$proformaInvoice.paymentStatus',
                stageName: 1,
                Activity: 1,
                totalSuppliers: {
                    $size: {
                        $setUnion: {
                            $map: {
                                input:
                                    '$enquirysupplierselecteditems',
                                as: 'item',
                                in: '$$item.supplierId'
                            }
                        }
                    }
                }
            }
        }
    ];
    if (isActive) {
        pipeline[0]['$match']['isActive'] = isActive === 'true' ? true : false;
    }

    if (search) {
        pipeline[0]['$match']['$or'] = [
            { 'salesOrder.Id': { $regex: `${search}.*`, $options: 'i' } },
            { 'proformaInvoice.Id': { $regex: `${search}.*`, $options: 'i' } },
            { companyName: { $regex: `${search}.*`, $options: 'i' } },
            { contactPerson: { $regex: `${search}.*`, $options: 'i' } }
        ];
    }

    if (sortBy && sortOrder) {
        pipeline[1]['$sort'][sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
        pipeline[1]['$sort']['updatedAt'] = -1;
    }
    return pipeline;
};

// ========================= Supplier PO ============================= //

/**
 * Generates an aggregation pipeline to retrieve enquiry Spupplier po by enquiryId.
 *
 * @param {string} enquiryId - The enquiry's unique identifier.
 * @param {string} orgId - org id.
 * @returns {Array} - An aggregation pipeline
 */
exports.getAllSupplierPoOfEnquiryPipeline = (enquiryId, orgId) => [
    {
        $match: {
            _id: new mongoose.Types.ObjectId(enquiryId),
            organisationId: new mongoose.Types.ObjectId(orgId),
            level: 5,
            isSupplierPOCreated: true,
            isDeleted: false
        }
    },
    {
        $project: {
            proformaInvoice: 1,
            organisationId: 1,
            leadContactId: 1,
            leadId: 1,
            Id: 1,
            level: 1,
            isItemAdded: 1,
            isItemShortListed: 1,
            isQuoteCreated: 1,
            isPiCreated: 1,
            isSalesOrderCreated: 1,
            quoteId: 1,
            stageName: 1,
            companyName: 1,
            contactPerson: 1,
            salesOrderId: '$salesOrder.Id',
            isSupplierPOCreated: 1,
            supplierPOId: 1,
            totalSuppliers: 1
        }
    },
    {
        $lookup: {
            from: 'enquiryquotes',
            localField: 'quoteId',
            foreignField: '_id',
            as: 'quoteData'
        }
    },
    {
        $unwind: {
            path: '$quoteData',
            preserveNullAndEmptyArrays: true
        }
    },
    {
        $lookup: {
            from: 'enquirysupplierselecteditems',
            localField: 'quoteData.enquiryFinalItemId',
            foreignField: '_id',
            as: 'quoteData.enquiryFinalItem'
        }
    },
    {
        $lookup: {
            from: 'organisations',
            localField: 'organisationId',
            foreignField: '_id',
            as: 'quoteData.orgData'
        }
    },
    {
        $unwind: {
            path: '$quoteData.orgData',
            preserveNullAndEmptyArrays: true
        }
    },
    {
        $lookup: {
            from: 'organisationaddresses',
            let: {
                organisationId: '$organisationId'
            },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                {
                                    $eq: [
                                        '$organisationId',
                                        '$$organisationId'
                                    ]
                                },
                                {
                                    $eq: [
                                        '$addresstype',
                                        'Billing'
                                    ]
                                }
                            ]
                        }
                    }
                }
            ],
            as: 'quoteData.organisationAddress'
        }
    },
    {
        $unwind: {
            path: '$quoteData.organisationAddress',
            preserveNullAndEmptyArrays: true
        }
    },
    {
        $lookup: {
            from: 'leads',
            localField: 'leadId',
            foreignField: '_id',
            as: 'leadData'
        }
    },
    {
        $unwind: {
            path: '$leadData',
            preserveNullAndEmptyArrays: true
        }
    },
    {
        $lookup: {
            from: 'leadcontacts',
            localField: 'leadContactId',
            foreignField: '_id',
            as: 'leadContactData'
        }
    },
    {
        $unwind: {
            path: '$leadContactData',
            preserveNullAndEmptyArrays: true
        }
    },
    {
        $addFields: {
            totalSuppliers: {
                $cond: {
                    if: {
                        $ne: [
                            {
                                $ifNull: [
                                    '$totalSuppliers',
                                    null
                                ]
                            },
                            null
                        ]
                    },
                    then: '$totalSuppliers',
                    else: {
                        $setUnion: {
                            $map: {
                                input:
                                    '$quoteData.enquiryFinalItem',
                                as: 'item',
                                in: '$$item.supplierId'
                            }
                        }
                    }
                }
            }
        }
    },
    {
        $project: {
            'quoteData.enquiryFinalItem': 0
        }
    },
    {
        $lookup: {
            from: 'suppliers',
            localField: 'totalSuppliers',
            foreignField: '_id',
            pipeline: [
                {
                    $project: {
                        _id: 1,
                        companyName: 1,
                        Id: 1,
                        email: 1,
                        phone: 1
                    }
                },
                {
                    $lookup: {
                        from: 'enquirysupplierpos',
                        let: {
                            id: '$_id',
                            enquiryId: new mongoose.Types.ObjectId(enquiryId)
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {
                                                $eq: [
                                                    '$supplierId',
                                                    '$$id'
                                                ]
                                            },
                                            {
                                                $eq: [
                                                    '$enquiryId',
                                                    '$$enquiryId'
                                                ]
                                            }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: 'poData'
                    }
                },
                {
                    $unwind: {
                        path: '$poData',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'supplieraddresses',
                        let: {
                            id: '$_id'
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {
                                                $eq: [
                                                    '$supplierId',
                                                    '$$id'
                                                ]
                                            },
                                            {
                                                $eq: [
                                                    '$isDeleted',
                                                    false
                                                ]
                                            },
                                            {
                                                $eq: [
                                                    '$addresstype',
                                                    'Billing'
                                                ]
                                            }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: 'billingAddress'
                    }
                },
                {
                    $lookup: {
                        from: 'enquirysupplierselecteditems',
                        let: {
                            id: '$_id',
                            enquiryId: new mongoose.Types.ObjectId(enquiryId)
                        },
                        pipeline: [
                            // Add your stages here based on the requirements
                            {
                                $match: {
                                    $expr: {
                                        // Your match conditions here
                                        $and: [
                                            {
                                                $eq: [
                                                    '$supplierId',
                                                    '$$id'
                                                ]
                                            },
                                            {
                                                $eq: [
                                                    '$enquiryId',
                                                    '$$enquiryId'
                                                ]
                                            },
                                            {
                                                $eq: [
                                                    '$isShortListed',
                                                    true
                                                ]
                                            }
                                        ]
                                    }
                                }
                            },
                            {
                                $lookup: {
                                    from: 'supplieritems',
                                    localField: 'supplierItemId',
                                    foreignField: '_id',
                                    as: 'supplieritems'
                                }
                            },
                            {
                                $unwind: {
                                    path: '$supplieritems',
                                    preserveNullAndEmptyArrays: true
                                }
                            }
                        ],
                        as: 'enquiryFinalItem'
                    }
                },
                {
                    $addFields: {
                        financeMeta: '$poData.financeMeta'
                    }
                }
            ],
            as: 'totalSuppliers'
        }
    },
    {
        $lookup: {
            from: 'leadaddresses',
            localField: 'leadId',
            foreignField: 'leadId',
            pipeline: [
                {
                    $match: {
                        isActive: true,
                        isDeleted: false,
                        addresstype: 'Shipping'
                    }
                }
            ],
            as: 'shippingAddress'
        }
    },
    {
        $lookup: {
            from: 'warehouses',
            localField: 'organisationId',
            foreignField: 'organisationId',
            pipeline: [
                {
                    $match: {
                        isActive: true,
                        isDeleted: false
                    }
                }
            ],
            as: 'warehouses'
        }
    }
];

/**
 * Generates an aggregation pipeline to retrieve enquiry Spupplier po by enquiryId.
 *
 * @param {string} orgId - org id.
 * @param {GetAllLeadOptions} options - Options to customize the lead retrieval.
 * @returns {Array} - An aggregation pipeline
 */
exports.getAllSupplierPoForDashboardPipeline = (orgId, { isActive, page, perPage, sortBy, sortOrder, search }) => {
    const pipeline = [
        {
            $match: {
                organisationId: new mongoose.Types.ObjectId(orgId),
                level: 5,
                isSupplierPOCreated: true,
                isDeleted: false
            }
        },
        {
            $sort: {
                'updatedAt': -1
            }
        },
        {
            $skip: (page - 1) * perPage
        },
        {
            $limit: perPage
        },
        {
            $project: {
                organisationId: 1,
                leadContactId: 1,
                leadId: 1,
                companyName: 1,
                contactPerson: 1,
                Id: 1,
                level: 1,
                isItemAdded: 1,
                isItemShortListed: 1,
                isQuoteCreated: 1,
                isPiCreated: 1,
                isSalesOrderCreated: 1,
                stageName: 1,
                salesOrderId: '$salesOrder.Id',
                isSupplierPOCreated: 1,
                supplierPOId: 1
            }
        },
        {
            $lookup: {
                from: 'enquirysupplierpos',
                localField: 'supplierPOId',
                foreignField: '_id',
                as: 'poData'
            }
        },
        {
            $unwind: {
                path: '$poData',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: 'suppliers',
                localField: 'poData.supplierId',
                foreignField: '_id',
                as: 'poData.suppliersCompanyName'
            }
        },
        {
            $lookup: {
                from: 'warehouses',
                localField: 'poData.warehouseId',
                foreignField: '_id',
                as: 'poData.warehouseName'
            }
        },
        {
            $addFields: {
                stageName: '$poData.stageName',
                supplierPOId: '$poData.Id',
                supplierPO_id: '$poData._id',
                'poData.suppliersCompanyName': {
                    $arrayElemAt: [
                        '$poData.suppliersCompanyName',
                        0
                    ]
                },
                'poData.warehouseName': {
                    $arrayElemAt: [
                        '$poData.warehouseName',
                        0
                    ]
                }
            }
        },
        {
            $lookup: {
                from: 'enquirysupplierselecteditems',
                localField: 'poData.enquiryFinalItemId',
                foreignField: '_id',
                as: 'enquirysupplierselecteditems'
            }
        },
        {
            $addFields: {
                suppliersCompanyName:
                    '$poData.suppliersCompanyName.companyName',
                warehouseName: {
                    $cond: {
                        if: {
                            $and: [
                                {
                                    $ifNull: ['$poData', false]
                                },
                                {
                                    $ifNull: [
                                        '$poData.warehouseName',
                                        false
                                    ]
                                }
                            ]
                        },
                        then: '$poData.warehouseName.name',
                        else: null
                    }
                },
                totalItemQuantity: {
                    $reduce: {
                        input: '$enquirysupplierselecteditems',
                        initialValue: 0,
                        in: {
                            $add: [
                                '$$value',
                                {
                                    $toDouble:
                                        '$$this.finalItemDetails.quantity'
                                }
                            ]
                        }
                    }
                },
                validTillDate: '$poData.validTillDate',
                poValue: {
                    $add: [
                        '$poData.financeMeta.freightChargesConverted',
                        '$poData.financeMeta.packingChargesConverted',
                        '$poData.financeMeta.supplierTotalConverted'
                    ]
                }
            }
        },
        {
            $project: {
                poData: 0
            }
        }
    ];

    if (isActive) {
        pipeline[0]['$match']['isActive'] = isActive === 'true' ? true : false;
    }

    if (search) {
        let obj = {
            '$match': {
                '$or': [
                    { companyName: { $regex: `${search}.*`, $options: 'i' } },
                    { contactPerson: { $regex: `${search}.*`, $options: 'i' } },
                    { 'supplierPOId': { $regex: `${search}.*`, $options: 'i' } },
                    { 'salesOrderId': { $regex: `${search}.*`, $options: 'i' } },
                    { suppliersCompanyName: { $regex: `${search}.*`, $options: 'i' } },
                    { warehouseName: { $regex: `${search}.*`, $options: 'i' } }
                ]
            }
        };
        pipeline.push(obj);
    }

    if (sortBy && sortOrder) {
        let obj = {
            '$sort': {
                [sortBy]: sortOrder === 'desc' ? -1 : 1
            }
        };
        pipeline.push(obj);
    }
    return pipeline;
};
