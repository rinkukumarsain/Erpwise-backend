const mongoose = require('mongoose');
// const moment = require('moment');

/**
 * Options for customizing the suppliers retrieval.
 *
 * @typedef {object} GetAllSuppliersOptions
 * @property {boolean} isActive - Filter suppliers based on their activation status.
 * @property {number} page - The current page for pagination.
 * @property {number} perPage - The number of suppliers to display per page.
 * @property {string} sortBy - Field to sort by.
 * @property {string} sortOrder - Sort order.
 * @property {number} level - The level of the suppliers.
 */

/**
 * Generates an aggregation pipeline to retrieve a paginated and sorted list of suppliers.
 *
 * @param {string} orgId - The organization's unique identifier.
 * @param {GetAllSuppliersOptions} options - Options to customize the suppliers retrieval.
 * @returns {Array} - An aggregation pipeline to retrieve a paginated and sorted list of suppliers.
 */
exports.getAllSupplierPipeline = (orgId, { isActive, page, perPage, sortBy, sortOrder, level, supplierId, search }) => {
    let pipeline = [
        {
            $match: {
                organisationId: new mongoose.Types.ObjectId(orgId),
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
            $addFields: {
                result: {
                    $arrayElemAt: ['$result', 0]
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
                }
            }
        },
        {
            $project: {
                _id: 1,
                Id: 1,
                companyName: 1,
                businessAddress: 1,
                level: 1,
                isContactAdded: 1,
                isBillingAddressAdded: 1,
                isShippingAddressAdded: 1,
                isItemAdded: 1,
                isFinanceAdded: 1,
                Activity: 1,
                isActive: 1,
                currencyText: 1,
                createdAt: 1,
                updatedAt: 1,
                organisationId: 1,
                industryType: 1,
                isApproved: 1

            }
        },
        {
            $lookup: {
                from: 'suppliercontacts',
                let: {
                    suppierId: '$_id'
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$supplierId', '$$suppierId'] },
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
                as: 'supplierContacts'
            }
        },
        {
            $lookup: {
                from: 'supplieritems',
                let: {
                    supplierId: '$_id'
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$supplierId', '$$supplierId'] },
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
                as: 'supplierItems'
            }
        }
    ];

    if (isActive) {
        pipeline[0]['$match']['isActive'] = isActive === 'true' ? true : false;
    }

    if (supplierId) {
        pipeline[0]['$match']['_id'] = new mongoose.Types.ObjectId(supplierId);
    }

    if (level) {
        pipeline[0]['$match']['level'] = +level;
    }

    if (sortBy && sortOrder) {
        pipeline[1]['$sort'][sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
        pipeline[1]['$sort']['updatedAt'] = -1;
    }
    if (search) {
        pipeline[0]['$match']['$or'] = [
            { Id: { $regex: `${search}.*`, $options: 'i' } },
            { companyName: { $regex: `${search}.*`, $options: 'i' } },
            { address: { $regex: `${search}.*`, $options: 'i' } },
            { salesPersonName: { $regex: `${search}.*`, $options: 'i' } },
            { industryType: { $regex: `${search}.*`, $options: 'i' } }
        ];
    }

    return pipeline;
};

/**
 * Generates an aggregation pipeline to retrieve suppliers by id.
 *
 * @param {string} orgId - The organization's unique identifier.
 * @param {string} supplierId - The supplier's unique identifier.
 * @returns {Array} - An aggregation pipeline to retrieve a supplier by id.
 */
exports.getSupplierByIdPipeline = (orgId, supplierId) => [
    {
        $match: {
            organisationId: new mongoose.Types.ObjectId(orgId),
            _id: new mongoose.Types.ObjectId(supplierId)
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
            from: 'suppliercontacts',
            let: {
                supplierId: '$_id'
            },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: ['$supplierId', '$$supplierId'] },
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
            as: 'supplierContacts'
        }
    },
    {
        $lookup: {
            from: 'supplieraddresses',
            localField: '_id',
            foreignField: 'supplierId',
            as: 'supplierAddresses'
        }
    },
    {
        $lookup: {
            from: 'supplieritems',
            let: {
                supplierId: '$_id'
            },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: ['$supplierId', '$$supplierId'] },
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
            as: 'supplierItems'
        }
    }
];

/**
 * Generate an aggregation pipeline to fetch supplier dashboard count.
 *
 * @param {string} orgId - The ID of the organisation.
 * @returns {Array} - An array representing the aggregation pipeline.
 */
exports.getSupplierDashBoardCount = (orgId) => [
    {
        $match: {
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
    }
];

/**
 * Generate an aggregation pipeline to fetch supplier pipeline section data.
 *
 * @param {string} orgId - The ID of the organisation.
 * @returns {Array} - An array representing the aggregation pipeline.
 */
exports.getPipelineData = (orgId) => [
    {
        $match: {
            organisationId: new mongoose.Types.ObjectId(orgId),
            level: 2
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
        $lookup: {
            from: 'users',
            localField: 'updatedBy',
            foreignField: '_id',
            as: 'updatedByName'
        }
    },
    {
        $addFields: {
            result: {
                $arrayElemAt: ['$result', 0]
            },
            userDetails: {
                $arrayElemAt: ['$userDetails', 0]
            },
            updatedByName: {
                $arrayElemAt: ['$updatedByName', 0]
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
            },
            updatedByName: {
                $concat: [
                    '$updatedByName.fname',
                    ' ',
                    '$updatedByName.lname'
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
            isActive: 0,
            documents: 0,
            isContactAdded: 0,
            isShippingAddressAdded: 0,
            isBillingAddressAdded: 0,
            isFinanceAdded: 0,
            isItemAdded: 0
        }
    },
    {
        $lookup: {
            from: 'supplieritems',
            localField: '_id',
            foreignField: 'supplierId',
            as: 'supplieritems'
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
            _id: '$pipelineStage',
            data: {
                $push: '$$ROOT'
            },
            count: {
                $sum: 1
            }
        }
    }
];

/**
 * Generate an aggregation pipeline to fetch supplier pipeline section data.
 * 
 * @param {string} orgId - Id of organisation
 * @param {string} searchString - search string to search items by their part nunmber
 * @param {string} exactMatch - yes/no
 * @returns {Array} - An array representing the aggregation pipeline of all available supplier items
 */
exports.searchIteamForEnquiry = (orgId, searchString, exactMatch) => {
    let arr = [
        {
            $match: {
                organisationId: new mongoose.Types.ObjectId(orgId),
                partNumberCode: {
                    $regex: new RegExp(searchString, 'i')
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
        }
    ];

    if (exactMatch == 'yes') {
        arr[0]['$match'].partNumberCode = searchString;
    }
    return arr;
};