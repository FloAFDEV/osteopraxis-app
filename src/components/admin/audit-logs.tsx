import React, { useState, useEffect } from "react";
import { adminService, AuditLog } from "@/services/admin-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, Clock, User, Database } from "lucide-react";

export function AuditLogsPanel() {
	const [logs, setLogs] = useState<AuditLog[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadLogs();
	}, []);

	const loadLogs = async () => {
		try {
			setLoading(true);
			const data = await adminService.getAuditLogs(50);
			setLogs(data);
		} catch (error) {
			console.error("Erreur lors du chargement des logs:", error);
		} finally {
			setLoading(false);
		}
	};

	const getActionBadge = (action: string) => {
		const colors = {
			UPDATE_USER_STATUS: "bg-blue-500/10 text-blue-500",
			UPDATE_USER_ROLE: "bg-purple-500/10 text-purple-500",
			SOFT_DELETE: "bg-red-500/10 text-red-500",
			RESTORE: "bg-green-500/10 text-green-500",
		};

		return (
			<Badge
				className={
					colors[action as keyof typeof colors] ||
					"bg-gray-500/10 text-gray-500"
				}
			>
				{action}
			</Badge>
		);
	};

	if (loading) {
		return (
			<Card>
				<CardContent className="flex items-center justify-center h-64">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Eye className="h-5 w-5" />
					Logs d'Audit
				</CardTitle>
			</CardHeader>
			<CardContent>
				<ScrollArea className="h-96">
					<div className="space-y-3">
						{logs.map((log) => (
							<div
								key={log.id}
								className="border rounded-lg p-3 hover:bg-muted/50"
							>
								<div className="flex items-center justify-between mb-2">
									<div className="flex items-center gap-2">
										{getActionBadge(log.action)}
										<span className="text-sm text-muted-foreground">
											sur {log.table_name}
										</span>
									</div>
									<div className="flex items-center gap-1 text-sm text-muted-foreground">
										<Clock className="h-3 w-3" />
										{new Date(
											log.created_at,
										).toLocaleString("fr-FR")}
									</div>
								</div>

								<div className="flex items-center gap-2 text-sm">
									<User className="h-3 w-3" />
									<span>
										ID: {log.user_id.slice(0, 8)}...
									</span>
									<Database className="h-3 w-3 ml-2" />
									<span>
										Record: {log.record_id.slice(0, 8)}...
									</span>
								</div>

								{log.new_values && (
									<div className="mt-2 text-sm">
										<span className="text-muted-foreground">
											Modifications:{" "}
										</span>
										<code className="bg-muted px-1 rounded">
											{JSON.stringify(log.new_values)}
										</code>
									</div>
								)}
							</div>
						))}
					</div>
				</ScrollArea>
			</CardContent>
		</Card>
	);
}
