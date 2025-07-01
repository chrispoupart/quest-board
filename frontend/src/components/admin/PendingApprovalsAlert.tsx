import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { AlertCircle, Clock, ShoppingCart, CheckCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PendingApprovalsAlertProps {
    pendingQuests?: number;
    pendingStoreItems?: number;
}

const PendingApprovalsAlert: React.FC<PendingApprovalsAlertProps> = ({
    pendingQuests = 0,
    pendingStoreItems = 0
}) => {
    const totalPending = pendingQuests + pendingStoreItems;

    if (totalPending === 0) {
        return null;
    }

    return (
        <Card className="border-2 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20 shadow-lg">
            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                        <AlertCircle className="w-8 h-8 text-orange-600" />
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                                Approval Required
                            </h3>
                            <Badge variant="destructive" className="text-xs">
                                {totalPending} pending
                            </Badge>
                        </div>

                        <p className="text-orange-800 dark:text-orange-200 mb-4">
                            There {totalPending === 1 ? 'is' : 'are'} {totalPending} item{totalPending > 1 ? 's' : ''} awaiting your approval.
                        </p>

                        <div className="flex flex-wrap gap-4 mb-4">
                            {pendingQuests > 0 && (
                                <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                                    <CheckCircle className="w-4 h-4" />
                                    <span className="text-sm font-medium">
                                        {pendingQuests} quest completion{pendingQuests > 1 ? 's' : ''}
                                    </span>
                                </div>
                            )}

                            {pendingStoreItems > 0 && (
                                <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                                    <ShoppingCart className="w-4 h-4" />
                                    <span className="text-sm font-medium">
                                        {pendingStoreItems} store purchase{pendingStoreItems > 1 ? 's' : ''}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <Link to="/admin">
                                <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                                    Review Approvals
                                </Button>
                            </Link>

                            <Button variant="outline" size="sm" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                                <Clock className="w-4 h-4 mr-2" />
                                Remind Later
                            </Button>
                        </div>
                    </div>

                    <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700">
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default PendingApprovalsAlert;
