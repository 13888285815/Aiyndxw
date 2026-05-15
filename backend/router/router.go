package router

import (
	"github.com/yndxw/workbuddy-ai/backend/controller"
	"github.com/yndxw/workbuddy-ai/backend/middleware"
	"github.com/gin-gonic/gin"
)

// ControllerSet 用于收集路由需要的控制器集合。
type ControllerSet struct {
	Auth             *controller.AuthController
	Conversation     *controller.ConversationController
	Message          *controller.MessageController
	Admin            *controller.AdminController
	Profile          *controller.ProfileController
	AIConfig         *controller.AIConfigController
	EmbeddingConfig  *controller.EmbeddingConfigController
	PromptConfig     *controller.PromptConfigController
	FAQ              *controller.FAQController
	Document         *controller.DocumentController
	KnowledgeBase    *controller.KnowledgeBaseController
	Import           *controller.ImportController
	Visitor          *controller.VisitorController
	Health           *controller.HealthController
	Analytics        *controller.AnalyticsController
	SystemLog        *controller.SystemLogController
}

// RegisterRoutes 注册 HTTP 路由及对应的处理函数。
func RegisterRoutes(r *gin.Engine, controllers ControllerSet, wsHandler gin.HandlerFunc) {
	// 定义一个不需要认证的路由注册函数
	registerPublic := func(routes gin.IRoutes) {
		// Auth
		routes.POST("/login", controllers.Auth.Login)
		routes.POST("/logout", controllers.Auth.Logout)

		// Visitor 相关 (公有)
		routes.POST("/conversation/init", controllers.Conversation.InitConversation)
		routes.GET("/conversations/:id", controllers.Conversation.GetConversationDetail) // 访客查看自己的对话
		routes.GET("/conversations/ai-models", controllers.Conversation.GetPublicAIModels)
		routes.POST("/messages", controllers.Message.CreateMessage)       // 访客发消息
		routes.POST("/messages/upload", controllers.Message.UploadFile)   // 访客传文件
		routes.PUT("/messages/read", controllers.Message.MarkMessagesRead) // 访客标记已读
		routes.GET("/messages", controllers.Message.ListMessages)         // 访客拉取消息

		routes.GET("/visitor/online-agents", controllers.Visitor.GetOnlineAgents)
		routes.GET("/visitor/widget-config", controllers.Visitor.GetWidgetConfig)
		routes.POST("/visitor/analytics/widget-open", controllers.Analytics.PostWidgetOpen)

		// Health (公有)
		routes.GET("/health", controllers.Health.HealthCheck)
		routes.GET("/health/metrics", controllers.Health.Metrics)

		// WebSocket (内部会校验 Token)
		routes.GET("/ws", wsHandler)
	}

	// 定义一个需要认证的路由注册函数
	registerProtected := func(routes gin.IRoutes) {
		// Conversation (客服管理)
		routes.GET("/conversations", controllers.Conversation.ListConversations)
		routes.POST("/conversations/internal", controllers.Conversation.InitInternalConversation)
		routes.POST("/conversations/:id/close", controllers.Conversation.CloseConversation)
		routes.PUT("/conversations/:id/contact", controllers.Conversation.UpdateContactInfo)
		routes.GET("/conversations/search", controllers.Conversation.SearchConversations)

		// Admin (用户管理)
		routes.GET("/admin/users", controllers.Admin.ListUsers)
		routes.GET("/admin/users/:id", controllers.Admin.GetUser)
		routes.POST("/admin/users", controllers.Admin.CreateUser)
		routes.PUT("/admin/users/:id", controllers.Admin.UpdateUser)
		routes.DELETE("/admin/users/:id", controllers.Admin.DeleteUser)
		routes.PUT("/admin/users/:id/password", controllers.Admin.UpdateUserPassword)
		routes.POST("/admin/agents", controllers.Admin.CreateAgent)

		// Profile
		routes.GET("/agent/profile/:user_id", controllers.Profile.GetProfile)
		routes.PUT("/agent/profile/:user_id", controllers.Profile.UpdateProfile)
		routes.POST("/agent/avatar/:user_id", controllers.Profile.UploadAvatar)

		// AI Config
		routes.POST("/agent/ai-config/:user_id", controllers.AIConfig.CreateAIConfig)
		routes.GET("/agent/ai-config/:user_id", controllers.AIConfig.ListAIConfigs)
		routes.GET("/agent/ai-config/:user_id/:id", controllers.AIConfig.GetAIConfig)
		routes.PUT("/agent/ai-config/:user_id/:id", controllers.AIConfig.UpdateAIConfig)
		routes.DELETE("/agent/ai-config/:user_id/:id", controllers.AIConfig.DeleteAIConfig)

		// Embedding / Prompt Config
		routes.GET("/agent/embedding-config", controllers.EmbeddingConfig.Get)
		routes.PUT("/agent/embedding-config", controllers.EmbeddingConfig.Update)
		routes.GET("/agent/prompts", controllers.PromptConfig.Get)
		routes.PUT("/agent/prompts", controllers.PromptConfig.Update)

		// FAQ / Document / KnowledgeBase
		routes.GET("/faqs", controllers.FAQ.ListFAQs)
		routes.GET("/faqs/:id", controllers.FAQ.GetFAQ)
		routes.POST("/faqs", controllers.FAQ.CreateFAQ)
		routes.PUT("/faqs/:id", controllers.FAQ.UpdateFAQ)
		routes.DELETE("/faqs/:id", controllers.FAQ.DeleteFAQ)

		routes.GET("/documents", controllers.Document.ListDocuments)
		routes.GET("/documents/:id", controllers.Document.GetDocument)
		routes.POST("/documents", controllers.Document.CreateDocument)
		routes.PUT("/documents/:id", controllers.Document.UpdateDocument)
		routes.DELETE("/documents/:id", controllers.Document.DeleteDocument)
		routes.GET("/documents/search", controllers.Document.SearchDocuments)
		routes.GET("/documents/hybrid-search", controllers.Document.HybridSearchDocuments)
		routes.PUT("/documents/:id/status", controllers.Document.UpdateDocumentStatus)
		routes.POST("/documents/:id/publish", controllers.Document.PublishDocument)
		routes.POST("/documents/:id/unpublish", controllers.Document.UnpublishDocument)

		routes.GET("/knowledge-bases", controllers.KnowledgeBase.ListKnowledgeBases)
		routes.GET("/knowledge-bases/:id", controllers.KnowledgeBase.GetKnowledgeBase)
		routes.POST("/knowledge-bases", controllers.KnowledgeBase.CreateKnowledgeBase)
		routes.PUT("/knowledge-bases/:id", controllers.KnowledgeBase.UpdateKnowledgeBase)
		routes.PATCH("/knowledge-bases/:id/rag-enabled", controllers.KnowledgeBase.UpdateKnowledgeBaseRAGEnabled)
		routes.DELETE("/knowledge-bases/:id", controllers.KnowledgeBase.DeleteKnowledgeBase)
		routes.GET("/knowledge-bases/:id/documents", controllers.KnowledgeBase.ListDocumentsByKnowledgeBase)

		// Import
		routes.POST("/import/documents", controllers.Import.ImportDocuments)
		routes.POST("/import/urls", controllers.Import.ImportFromURLs)

		// Analytics / Logs
		routes.GET("/agent/analytics/summary", controllers.Analytics.GetSummary)
		routes.GET("/agent/logs/api", controllers.SystemLog.GetLogs)
		routes.GET("/agent/logs/min-level", controllers.SystemLog.GetLogMinLevel)
		routes.PUT("/agent/logs/min-level", controllers.SystemLog.PutLogMinLevel)
		routes.DELETE("/agent/logs/min-level", controllers.SystemLog.DeleteLogMinLevel)
		routes.POST("/agent/logs/frontend", controllers.SystemLog.ReportFrontendLog)
	}

	// 注册公有路由
	registerPublic(r)
	registerPublic(r.Group("/api"))

	// 注册受保护路由
	protected := r.Group("/", middleware.RequireAuth())
	registerProtected(protected)

	protectedAPI := r.Group("/api", middleware.RequireAuth())
	registerProtected(protectedAPI)
}
